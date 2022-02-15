import * as InteractTypes from 'types/interact.types';
import * as FlowTypes from 'types/flow.types.v2';
import * as FlowUtil from '../flow-util';
import { getPublicInterface } from '../methods';

/**
 * MXFlow tool which handles lasso selection
 */
function MXFlowLinkerTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>, interactions: InteractTypes.InteractionEmitter) : FlowTypes.ActionHandler {
    const state = api.state;
    const dom = api.dom;
    //let active = false;
    let fromEdge: FlowTypes.Edge | null = null;
    let lastEdge: FlowTypes.Edge | null;

    const applyGhostLinkPosition = (e: PointerEvent, toEdge?: FlowTypes.Edge) => {
        let transform = state.transform;
        let containerRect = dom.containerEl.getBoundingClientRect();
        let offsetY = containerRect.top;
        let offsetX = containerRect.left;

        let latchFrom = FlowUtil.getEdgeLatchPos(fromEdge!, offsetX, offsetY);
        let x1 = latchFrom.x;
        let y1 = latchFrom.y;

        let x2, y2;
        if (toEdge){
            let latchTo = FlowUtil.getEdgeLatchPos(toEdge, offsetX, offsetY);
            x2 = latchTo.x;
            y2 = latchTo.y;
        } else {
            //[x2, y2] = methods.pageToGraphPos(e.pageX, e.pageY);
            // x2 = e.pageX - offsetX;
            // y2 = e.pageY - offsetY;
            x2 = e.pageX - api.dom.containerEl.offsetLeft;
            y2 = e.pageY - api.dom.containerEl.offsetTop;
        }

        /**
         * Reverse link direction so that it stays uniform regardless of which end it was dragged from
         */
        if (x1 > x2){
            [x1, x2] = FlowUtil.swapValues(x1, x2);
            [y1, y2] = FlowUtil.swapValues(y1, y2);
        }

        dom.ghostLinkEl.setAttribute('d', 
            FlowUtil.getBezierPath(
                (x1 - transform.x) / transform.scale,
                (y1 - transform.y) / transform.scale,
                (x2 - transform.x) / transform.scale,
                (y2 - transform.y) / transform.scale,
                api.opts.bezierWeight
            )
        )
    }

    const isValidEvent = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
        return e.isPrimary && item && item.type === 'edge' && (e.pointerType !== 'mouse' || e.button === api.opts.controls.selectButton);
    }

    const handleDown = (e: InteractTypes.MXPointerEvent) => {
        let item = methods.resolveItem(e.source);
        if (isValidEvent(e.source, item)){
            item = <FlowTypes.Edge> item;
            if (api.opts.beforeLinkStart(item)){
                fromEdge = item;   
                dom.ghostLinkEl.style.display = "block";
                api.lock('linker');
                applyGhostLinkPosition(e.source);
                interactions.on('move', handleMove);
                interactions.on('up', handleUp); 
            }
        }
    }

    const handleMove = (e: InteractTypes.MXPointerEvent) => {
        if (e.source.isPrimary){
            let item = methods.resolveItem(e.source);
            if (item && item.key !== fromEdge?.key && item.type === 'edge'){
                lastEdge = item;
                let isValid = methods.isLinkValid(fromEdge!, item);
                if (isValid){
                    dom.ghostLinkEl.classList.remove(FlowTypes.FlowClass.LinkInvalid);
                    dom.ghostLinkEl.classList.add(FlowTypes.FlowClass.LinkValid);
                    item.el.classList.remove(FlowTypes.FlowClass.EdgeInvalid);
                    item.el.classList.add(FlowTypes.FlowClass.EdgeValid);
                } else {
                    dom.ghostLinkEl.classList.remove(FlowTypes.FlowClass.LinkValid);
                    dom.ghostLinkEl.classList.add(FlowTypes.FlowClass.LinkInvalid);
                    item.el.classList.remove(FlowTypes.FlowClass.EdgeValid);
                    item.el.classList.add(FlowTypes.FlowClass.EdgeInvalid);
                }

                applyGhostLinkPosition(e.source, item);
                return;

            } else {
                dom.ghostLinkEl.classList.remove(FlowTypes.FlowClass.LinkValid);
                dom.ghostLinkEl.classList.remove(FlowTypes.FlowClass.LinkInvalid);
                if (lastEdge){
                    lastEdge.el.classList.remove(FlowTypes.FlowClass.EdgeValid);
                    lastEdge.el.classList.remove(FlowTypes.FlowClass.EdgeInvalid);
                    lastEdge = null;
                }
            }

            applyGhostLinkPosition(e.source);
        }
    }

    const handleUp = (e: InteractTypes.MXPointerEvent) => {
        let item = methods.resolveItem(e.source)
        if (e.source.isPrimary) endLinking();
        if (!isValidEvent(e.source, item)) return;

        item = <FlowTypes.Edge> item;

        if (e.source.button !== api.opts.controls.selectButton) return;
        if (!api.opts.beforeLinkEnd(fromEdge!, item)) return;
        if (methods.isLinkValid(fromEdge!, item)){ //Internal validation
            methods.addLink(fromEdge!.nodeKey, fromEdge!.edgeKey, item.nodeKey, item.edgeKey);
        }
    }

    const endLinking = () => {
        dom.ghostLinkEl.style.display = "none";
        if (lastEdge){
            lastEdge.el.classList.remove(FlowTypes.FlowClass.EdgeValid);
            lastEdge.el.classList.remove(FlowTypes.FlowClass.EdgeInvalid);
            lastEdge = null;
        }

        interactions.removeListener('move', handleMove);
        interactions.removeListener('up', handleUp); 
        api.unlock();
    }

    interactions.on('down', handleDown);
    const dispose = () => {
        interactions.removeListener('down', handleDown);
        interactions.removeListener('move', handleMove);
        interactions.removeListener('up', handleUp); 
    }

    return <const> {
        name: 'linker',
        dispose
    }
}

export default MXFlowLinkerTool;
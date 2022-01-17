import * as FlowTypes from 'types/flow.types.v2';
import * as FlowUtil from '../flow-util';
import { getPublicInterface } from '../methods';

/**
 * MXFlow tool which handles lasso selection
 */
function MXFlowLinkerTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>) : FlowTypes.ActionHandler {
    const state = api.state;
    const dom = api.dom;
    let active = false;
    let fromEdge: FlowTypes.Edge | null = null;

    const applyGhostLinkPosition = (e: PointerEvent, toEdge?: FlowTypes.Edge) => {
        let transform = state.transform;
        let containerRect = dom.containerEl.getBoundingClientRect();
        //let fromEdgeRect = <DOMRect> fromEdge!.el.getBoundingClientRect();

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
            x2 = e.pageX - offsetX;
            y2 = e.pageY - offsetY;
        }

        // let x2 = latchTo.x;
        // let y2 = latchTo.y

        // let x1 = (fromEdgeRect.right - offsetX);
        // let y1 = (fromEdgeRect.top - offsetY) +  (fromEdgeRect.height / 2);

        // let x1 = latchFrom.x;
        // let y1 = latchFrom.y;
        // let x2 = e.pageX - offsetX;
        // let y2 = e.pageY - offsetY;

        dom.ghostLinkEl.setAttribute('d', 
            FlowUtil.getBezierPath(
                (x1 - transform.x) / transform.scale,
                (y1 - transform.y) / transform.scale,
                (x2 - transform.x) / transform.scale,
                (y2 - transform.y) / transform.scale,
                api.opts.bezierWeight ?? 0.675
            )
        )
    }

    const onDown = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
        if (!item || item.type !== 'edge') return;
        if (e.button !== api.opts.select?.button) return;
        if (!active){
            item = <FlowTypes.Edge> item;
            if (api.opts.beforeLinkStart && !api.opts.beforeLinkStart(item)) return;

            active = true;
            fromEdge = item;
            dom.ghostLinkEl.style.display = "block";
            api.lock('linker');
            applyGhostLinkPosition(e);
        } 
    }

    const onMove = (e: PointerEvent) => {
        if (active){
            let item = methods.resolveItem(e);
            if (item && item.type === 'edge'){
                let isValid = methods.isLinkValid(fromEdge!, item);
                if (isValid){
                    dom.ghostLinkEl.classList.remove(FlowTypes.FlowClass.LinkInvalid);
                    dom.ghostLinkEl.classList.add(FlowTypes.FlowClass.LinkValid);
                } else {
                    dom.ghostLinkEl.classList.remove(FlowTypes.FlowClass.LinkValid);
                    dom.ghostLinkEl.classList.add(FlowTypes.FlowClass.LinkInvalid);
                }

                applyGhostLinkPosition(e, item);
                return;

            } else {
                dom.ghostLinkEl.classList.remove(FlowTypes.FlowClass.LinkValid);
                dom.ghostLinkEl.classList.remove(FlowTypes.FlowClass.LinkInvalid);
            }

            applyGhostLinkPosition(e);
        }
    }

    const onUp = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
        endLinking();
        if (!item || item.type !== 'edge') {
            return;
        } else {
            item = <FlowTypes.Edge> item;
        }

        if (e.button !== api.opts.select?.button) return;
        if (api.opts.beforeLinkEnd && !api.opts.beforeLinkEnd(fromEdge!, item)) return;
        if (methods.isLinkValid(fromEdge!, item)){ //Internal validation

            //Reverse link direction if this link was done backwards
            // if (fromEdge?.type === 'input'){
            //     methods.addLink(item.nodeKey, item.edgeKey, fromEdge!.nodeKey, fromEdge!.edgeKey);
            //     return;
            // }

            methods.addLink(fromEdge!.nodeKey, fromEdge!.edgeKey, item.nodeKey, item.edgeKey);
        }
    }

    const endLinking = () => {
        active = false;
        dom.ghostLinkEl.style.display = "none";
        api.unlock();
    }

    return <const> {
        name: 'linker',
        onDown,
        onMove,
        onUp
    }
}

export default MXFlowLinkerTool;
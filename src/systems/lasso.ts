import * as InteractTypes from 'types/interact.types';
import * as FlowTypes from 'types/flow.types.v2';
import * as FlowUtil from '../flow-util';
import { getPublicInterface } from '../methods';

/**
 * MXFlow tool which handles lasso selection
 */
function MXFlowLassoTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>, interactions: InteractTypes.InteractionEmitter) : FlowTypes.ActionHandler {
    let state = api.state;
    let dom = api.dom;

    const update = (api: FlowTypes.Api) => {
        state = api.state;
        dom = api.dom;
    }

     const isValid = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
        if (!item || item.type !== 'graph') return;
        //if (interactions.isModActive('multiSelectModifier')) return;
        if (api.opts.controls.lassoModifier){
            return e.button ===  api.opts.controls.lassoButton && interactions.isModActive('lassoModifier');
        }
        return e.button ===  api.opts.controls.lassoButton;
    }

    
    const handleDragStart = (e: InteractTypes.MXDragEvent) => {
        let item = methods.resolveItem(e.source);
        if (isValid(e.source, item)){
            dom.lassoEl.style.display = 'block';
            api.lock('lasso');

            interactions.on('drag', handleDrag);
            interactions.on('dragend', handleDragEnd);
        }
    }

    const handleDrag = (e: InteractTypes.MXDragEvent) => {
        let preselected = new Map<string, FlowTypes.SelectableItem>();

        let width = Math.abs(e.deltaX)
        let height = Math.abs(e.deltaY);
        let left, top; [left, top] = methods.pageToContainerPos(
            Math.min(e.start.pageX, e.source.pageX),  
            Math.min(e.start.pageY, e.source.pageY)
        );
        
        dom.lassoEl.setAttribute('x', left + 'px');
        dom.lassoEl.setAttribute('y', top + 'px');
        dom.lassoEl.setAttribute('width', width + 'px');
        dom.lassoEl.setAttribute('height', height + 'px');

        // dom.lassoEl.style.left = left + 'px';
        // dom.lassoEl.style.top = top + 'px';
        // dom.lassoEl.style.width = width + 'px';
        // dom.lassoEl.style.height = height + 'px';

        let lassoRect = dom.lassoEl.getBoundingClientRect(); 
        state.nodes.forEach(node => {
            let nodeRect = node.el.getBoundingClientRect();
            if (FlowUtil.intersectRect(nodeRect, lassoRect)){
                preselected.set(node.key, node);
            }
        })

        methods.setPreselected(preselected);
    }

    const handleDragEnd = (e: InteractTypes.MXDragEvent) => {
        dom.lassoEl.style.display = 'none';
        dom.lassoEl.setAttribute('width', '0px');
        dom.lassoEl.setAttribute('height', '0px');

        //Emit events
        methods.setSelected(new Map(state.preselected));

        //Clear preselection and unlock api
        methods.setPreselected(new Map());
        api.unlock();

        //Remove our active handlers
        interactions.removeListener('drag', handleDrag);
        interactions.removeListener('dragend', handleDragEnd);
    }

    interactions.on('dragstart', handleDragStart);
    const dispose = () => {
        interactions.removeListener('dragstart', handleDragStart);
        interactions.removeListener('drag', handleDrag);
        interactions.removeListener('dragend', handleDragEnd);
    }

    return <const> {
        name: 'lasso',
        dispose,
        update
    }
}

export default MXFlowLassoTool;
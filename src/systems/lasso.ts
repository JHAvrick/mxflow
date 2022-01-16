import * as FlowTypes from 'types/flow.types.v2';
import * as FlowUtil from '../flow-util';
import { getPublicInterface } from '../methods';

/**
 * MXFlow tool which handles lasso selection
 */
function MXFlowLassoTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>) : FlowTypes.ActionHandler {
    let state = api.state;
    let dom = api.dom;
    let active = false;
    let startX = 0;
    let startY = 0;
    //let preselected = new Map<string, FlowTypes.FlowItem>();

    const onUpdate = (api: FlowTypes.Api) => {
        state = api.state;
        dom = api.dom;
    }

    const onDown = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
        if (!item || active) return;
        if (item.type === 'graph'){
            if (api.state.multi) return;
            if (e.button ===  api.opts.select?.button /* && api.dom.containerEl.contains(<HTMLElement> e.target) */){
                active = true;
                startX = e.pageX;
                startY = e.pageY;
                dom.lassoEl.style.display = 'block';
                api.lock('lasso');
            }
        }
    }

    const onMove = (e: PointerEvent) => {
        if (active){
            let preselected = new Map<string, FlowTypes.SelectableItem>();

            let left = startX < e.pageX ? startX : e.pageX;
            let top = startY < e.pageY ? startY : e.pageY;
            let width = startX < e.pageX ? e.pageX - startX : startX - e.pageX;
            let height = startY < e.pageY ? e.pageY - startY : startY - e.pageY;
    
            let containerRect = api.dom.containerEl.getBoundingClientRect();
            let offsetY = containerRect.top;
            let offsetX = containerRect.left;

            dom.lassoEl.style.left = (left - offsetX) + 'px';
            dom.lassoEl.style.top = (top - offsetY) + 'px';
            dom.lassoEl.style.width = width + 'px';
            dom.lassoEl.style.height = height + 'px';
    
            let lassoRect = {
                left: left,
                top: top,
                bottom: top + height,
                right: left + width
            }
            
            state.nodes.forEach(node => {
                let nodeRect = node.el.getBoundingClientRect();
                if (FlowUtil.intersectRect(nodeRect, lassoRect)){
                    preselected.set(node.key, node);
                }
            })

            methods.setPreselected(preselected);
        }
    }

    const onUp = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
        if (active){
            //if (!e.isPrimary || e.button !== api.opts.select?.button) return;
        
            dom.lassoEl!.style.display = 'none';
            dom.lassoEl!.style.width = '0px';
            dom.lassoEl!.style.height = '0px'
            active = false;
            startX = 0;
            startY = 0;
    
            /**
             * Emit events
             */
            methods.setSelected(new Map(state.preselected));
            methods.setPreselected(new Map());

            //state.selected = new Map(state.preselected);
            // state.preselected.clear();
            // api.emit('preselected', new Map());
            // api.emit('selected', new Map(state.selected));
            api.unlock();
        }
    }

    // document.addEventListener('pointerup', onUp);
    // const dispose = () => {
    //     document.removeEventListener('pointerup', onUp);
    // }

    return <const> {
        name: 'lasso',
        onUpdate,
        onDown,
        onMove,
        onUp
    }
}

export default MXFlowLassoTool;
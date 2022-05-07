import * as FlowTypes from 'types/flow.types.v2';
import * as InteractTypes from 'types/interact.types';

/**
 * MXFlow tool which handles basic selections w/ down and down + shift;
 */
function MXFlowSelectTool(api: FlowTypes.Api, methods: FlowTypes.Methods, interactions: InteractTypes.InteractionEmitter) : FlowTypes.ActionHandler {
    let state = api.state;
    let dragged = false;

    const update = (api: FlowTypes.Api) => state = api.state;
    const handleDragStart = () => dragged = true;

    const handleDown = (evt: InteractTypes.MXPointerEvent) => {
        let e = evt.source, item = methods.resolveItem(evt.source);
        if (!item || !methods.eventInGraph(e)) return;

        //Clear selection when down event is on graph
        let multi = interactions.isModActive('multiSelectModifier');
        if (item.type === 'graph'){
            if (multi) return;
            if (interactions.isModActive('lassoModifier') && e.button === api.opts.controls.lassoButton) return; 
            if (e.button === api.opts.controls.selectButton /* && api.dom.containerEl.contains(<HTMLElement> e.target) */){
                methods.setSelected([]);
            }
        }

        if (item.type !== 'link' && item.type !== 'node') return;
        if (e.button === api.opts.controls.selectButton){
            let noselect = false; //TODO - Check whether target has no-select attribute
            switch (true){
                /**
                 * Down on a single item, without shift, when there are either no items currently 
                 * selected, or there is only one and it is the target of the event. Begins drag on a
                 * single item.
                 */
                case !multi && !methods.isSelected(item):
                //case !multi && methods.isSelected(item) && state.selected.size === 1: //Removed because leftover from old drag code?
                    methods.setSelected([item]);
                    break;
        
                /**
                 * With shift held down, mouse down on an item that is not yet selected.
                 * Adds the target item to the selections.
                 */
                case multi && !methods.isSelected(item):
                    methods.addToSelection([item]);
                    break;
    
                /**
                 * With shift held down, mouse down on an item that is already selected.
                 * Deselects the target item.
                 */
                case multi && methods.isSelected(item):
                    methods.removeFromSelection([item.key]);
                    break; 
            }
        }
    }

    /**
     * Returns true if all conditions are met under which an up event should be handled
     */
    const shouldHandleUpEvt = (e: InteractTypes.MXPointerEvent, item?: FlowTypes.FlowItem) => {
        return  !dragged &&
                !interactions.isModActive('multiSelectModifier') &&
                methods.eventInGraph(e.source) && 
                item && (item.type === 'link' || item.type === 'node') &&
                state.selected.size > 1
    }

    /**
     * Handles the specific case of an `up` event on a node when multiple nodes are selected
     * and no drag event occurred. Deselects all other nodes.
     */
    const handleUp = (evt: InteractTypes.MXPointerEvent) => {
        let item = methods.resolveItem(evt.source);
        if (shouldHandleUpEvt(evt, item)){
            methods.setSelected([<FlowTypes.SelectableItem> item]);
        }
        dragged = false;
    }

    interactions.on('dragstart', handleDragStart);
    interactions.on('down', handleDown);
    interactions.on('up', handleUp);
    const dispose = () => {
        interactions.removeListener('dragstart', handleDragStart);
        interactions.removeListener('down', handleDown);
        interactions.removeListener('up', handleUp);
    }

    return <const> {
        name: 'select',
        dispose,
        update
    }
}

export default MXFlowSelectTool;
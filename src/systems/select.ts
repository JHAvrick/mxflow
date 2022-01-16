import * as FlowTypes from 'types/flow.types.v2';
import * as FlowUtil from '../flow-util';
import { getPublicInterface } from '../methods';

/**
 * MXFlow tool which handles basic selections w/ down and down + shift;
 */
function MXFlowSelectTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>) : FlowTypes.ActionHandler {
    let state = api.state;
    const onUpdate = (api: FlowTypes.Api) => {
        state = api.state;
    }

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === api.opts.select?.multiSelectKey){
            state.multi = true;
        }
    }

    const onKeyUp = (e: KeyboardEvent) => {
        if (e.key === api.opts.select?.multiSelectKey){
            state.multi = false;
        }
    }

    const onDown = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
        if (!item) return;

        //Clear selection when down event is on graph
        if (item.type === 'graph'){
            if (api.state.multi) return;
            if (e.button === api.opts.select?.button && api.dom.containerEl.contains(<HTMLElement> e.target)){
                methods.setSelected([]);
            }
        }

        if (item.type === 'link' || item.type === 'node'){
            item = <FlowTypes.SelectableItem> item;
        } else {
            return;
        }

        if (e.button === api.opts.select?.button){
            let noselect = false; //TODO - Check whether target has no-select attribute
            switch (true){
                /**
                 * Mouse down on a single item, without shift, when there is either no items currently 
                 * selected, or there is only one and it is the target of the event. Begins drag on a
                 * single item.
                 */
                case !state.multi && !methods.isSelected(item):
                case !state.multi && methods.isSelected(item) && state.selected.size === 1:
                    methods.setSelected([item]);
                    break;
        
                /**
                 * With shift held down, mouse down on an item that is not yet selected.
                 * Adds the target item to the selections.
                 */
                case state.multi && !methods.isSelected(item):
                    methods.addToSelection([item]);
                    break;
    
                /**
                 * With shift held down, mouse down on an item that is already selected.
                 * Deselects the target item.
                 */
                case state.multi && methods.isSelected(item):
                    methods.removeFromSelection([item.key]);
                    break; 
            }
        }
    }

    return <const> {
        name: 'select',
        onUpdate,
        onKeyDown,
        onKeyUp,
        onDown
    }
}

export default MXFlowSelectTool;
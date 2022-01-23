import * as FlowTypes from 'types/flow.types.v2';
import { getPublicInterface } from '../methods';

/**
 * Drag node tool
 */
function MXFlowContextTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>) : FlowTypes.ActionHandler {
    const onContextMenu = (e: MouseEvent, item?: FlowTypes.FlowItem) => {
        if (item){
            e.preventDefault();
            e.stopPropagation();
            let x, y; [x,y] = methods.pageToContainerPos(e.pageX, e.pageY);
            methods.openContextMenu(x, y, item);
        }
    }

    const onDown = () => methods.closeContextMenu();
    const onWheel = () =>  methods.closeContextMenu();
    
    api.dom.containerEl.addEventListener("wheel", onWheel);
    const dispose = () => {
        api.dom.containerEl.removeEventListener("wheel", onWheel);
    }

    return <const> {
        name: 'context',
        onContextMenu,
        onDown,
        dispose
    }
}

export default MXFlowContextTool;
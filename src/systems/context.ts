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
            methods.openContextMenu(e.pageX, e.pageY, item);
        }
    }

    const onDown = () => {
        methods.closeContextMenu();
    }

    return <const> {
        name: 'context',
        onContextMenu,
        onDown
    }
}

export default MXFlowContextTool;
import * as InteractTypes from 'types/interact.types';
import * as FlowTypes from 'types/flow.types.v2';
import { getPublicInterface } from '../methods';

/**
 * Drag node tool
 */
function MXFlowContextTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>, interactions: InteractTypes.InteractionEmitter) : FlowTypes.ActionHandler {
    const handleDown = () => methods.closeContextMenu();
    const handleWheel = () =>  methods.closeContextMenu();
    const handleContext = (e: InteractTypes.MXContextMenuEvent) => {
        if (e.item){
            let x, y; [x,y] = methods.pageToContainerPos(e.source.pageX, e.source.pageY);
            methods.openContextMenu(x, y, e.item);
        }
    }

    interactions.on('contextmenu', handleContext);
    interactions.on('down', handleDown);
    interactions.on('wheel', handleWheel);
    const dispose = () => {
        interactions.removeListener('contextmenu', handleContext);
        interactions.removeListener('down', handleDown);
        interactions.removeListener('wheel', handleWheel);
    }

    return <const> {
        name: 'context',
        dispose
    }
}

export default MXFlowContextTool;
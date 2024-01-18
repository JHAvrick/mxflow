import * as FlowTypes from 'types/flow.types.v2';
import { getPublicInterface } from '../methods';
import hotkeys, { HotkeysEvent } from 'hotkeys-js';

/**
 * Handlers for various shortcuts
 */
function MXFlowShortcutTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>) : FlowTypes.ActionHandler {


    const handleUndo = (e: KeyboardEvent, handler: HotkeysEvent) => {
        if (!methods.eventInGraph(e)) return;

        e.preventDefault();
        e.stopPropagation();

        methods.undo();
    }

    const handleRedo = (e: KeyboardEvent, handler: HotkeysEvent) => {
        if (!methods.eventInGraph(e)) return;

        e.preventDefault();
        e.stopPropagation();

        methods.redo();
    }

    const handleDelete = (e: KeyboardEvent, handler: HotkeysEvent) => {
        if (!methods.eventInGraph(e)) return;

        e.preventDefault();
        e.stopPropagation();

        methods.removeSelectedItems();
    }

    hotkeys('delete', { element: api.dom.containerEl }, handleDelete);
    hotkeys('ctrl+z, command+z', { element: api.dom.containerEl }, handleUndo);
    hotkeys('ctrl+shift+z, command+shift+z, ctrl+y, command+y', { element: api.dom.containerEl }, handleRedo);
    const dispose = () => {
        hotkeys.unbind('delete', handleDelete);
        hotkeys.unbind('ctrl+z, command+z', handleUndo);
        hotkeys.unbind('ctrl+shift+z, command+shift+z, ctrl+y, command+y', handleRedo);
    }

    return <const> {
        name: 'shortcut',
        dispose
    }
}

export default MXFlowShortcutTool;
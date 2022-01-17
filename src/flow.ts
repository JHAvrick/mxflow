import * as FlowTypes from 'types/flow.types.v2';
import * as FlowUtil from './flow-util';
import { EventEmitter, Listener } from 'util/event-emitter';
import { getPublicInterface } from './methods';
import { merge } from 'lodash';
import MXFlowSelectTool from './systems/select';
import MXFlowDragTool from './systems/drag';
import MXFlowLassoTool from './systems/lasso';
import MXFlowPanZoomTool from './systems//panzoom';
import MXFlowLinkerTool from './systems/linker';
import MXFlowContextTool from './systems/context';
import MXFlowShortcutTool from './systems/shortcut';

const getMXFlowState = (dom: FlowTypes.FlowDom) : FlowTypes.FlowState => {
    return {
        root: {
            key: 'graph',
            type: FlowTypes.FlowItemType.Graph,
            el: dom.rootEl
        },
        nodes: new Map<string, FlowTypes.Node>(),
        edges: new Map<string, FlowTypes.Edge>(),
        links: new Map<string, FlowTypes.Link>(),
        preselected: new Map<string, FlowTypes.SelectableItem>(),
        selected: new Map<string, FlowTypes.SelectableItem>(),
        contextOpen: false,
        multi: false,
        undo: [],
        redo: [],
        transform: {
            x: 0,
            y: 0,
            scale: 1
        }
    }
}

const DefaultOpts: FlowTypes.Options = {
    zIndexStart: 100,
    showGrid: true,
    gridSize: 32,
    bezierWeight: 0.675,
    beforeLinkStart: () => true,
    beforeLinkEnd: () => true,
    beforeNodeRemoved: () => true,
    beforeEdgeRemoved: () => true,
    beforeLinkRemoved: () => true,
    renderContext: () => {},
    render: () => {},
    drag: {
        cancelSelector: '',
        handleSelector: '',
        gridX: 0,
        gridY: 0,
        latchThreshold: 5
    },
    select: {
        button: 0,
        allowMultiselect: true,
        multiSelectKey: 'Shift'
    },
    undo: {
        enabled: true,
        max: 50,
        actions: [
            'drag',
            'addEdge',
            'removeEdge',
            'addLink',
            'removeLink',
            'addNode',
            'removeNode',
            'removeItems',
            'clear',
            'select'
        ]
    },
    panzoom: {
        minScale: 0.5,
        maxScale: 2,
        scaleStep: .25,
        scale: 1,
        x: 0,
        y: 0,
        panCursor: "grab",
        controls: {
            panButton: 1
        }
    }
}

function MXFlowController(targetEl: HTMLElement, options: FlowTypes.Options){
    let opts = merge(DefaultOpts, options);
    const dom = FlowUtil.generateFlowEl(targetEl, opts);
    const state = getMXFlowState(dom);
    const events = new EventEmitter();
    const tools = new Map<string, FlowTypes.ActionHandler>();
    const renderCache = new Map<string, Element | null>();

    //Internal event emitter. Passed to tool instances.
    const emit = <K extends keyof FlowTypes.FlowEventMap>(type: K, event?: FlowTypes.FlowEventMap[K]) => {
        events.emit(type, event);
    }

    //Methods to lock or unlock a specific tool. These are passed to tool instances only.
    let toolLock: FlowTypes.ActionHandler | false = false;
    const isLocked = () => toolLock !== false;
    const unlock = () => toolLock = false;
    const lock = (toolName: string) => {
        if (!toolLock && tools.has(toolName)){
            toolLock = tools.get(toolName)!;
        }
    }

    //API and methods, passed to tool instances.
    const api: FlowTypes.Api = <const> { tools, opts, dom, state, emit, lock, unlock, isLocked, renderCache };
    const methods = getPublicInterface(api);

    //Event handlers
    const handleDown = (e: PointerEvent) => {
        if (!e.isPrimary) return; //Ignore non-primary pointer events (for now)
        let item = methods.resolveItem(e); 
        if (item){
            if (toolLock){
                toolLock.onDown?.(e, item!);
            }
            tools.forEach(tool => tool.onDown?.(e, item!));
        }
    }

    const handleUp = (e: PointerEvent) => {
        if (!e.isPrimary) return; //Ignore non-primary pointer events (for now)
        let item = methods.resolveItem(e); 
        if (toolLock){
            toolLock.onUp?.(e, item!);
        }
        tools.forEach(tool => tool.onUp?.(e, item));
    }

    const handleContextMenu = (e: MouseEvent) => {
        let item = methods.resolveItem(e); 
        if (item){
            if (toolLock){
                toolLock.onContextMenu?.(e, item!);
                return;
            }
            tools.forEach(tool => tool.onContextMenu?.(e, item!));
        }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
        if (toolLock){
            toolLock.onKeyUp?.(e)
            return;
        }
        tools.forEach(tool => tool.onKeyUp?.(e));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (toolLock){
            toolLock.onKeyDown?.(e)
            return;
        }
        tools.forEach(tool => tool.onKeyDown?.(e));
    };

    const handleMove = (e: PointerEvent) => {
        if (toolLock){
            toolLock.onMove?.(e)
            return;
        }
        tools.forEach(tool => tool.onMove?.(e))
    };

    const setOptions = (options: FlowTypes.Options) => {
        opts = merge(DefaultOpts, options);
        api.opts = opts;
        tools.forEach(tool => tool.onUpdate?.(api));
    }

    /**
     * Cancels any active operation (linking, dragging, etc.)
     */
    const cancel = () => {
        tools.forEach(tool => tool.onCancel?.());
    }

    //Add tools
    tools.set('panzoom', MXFlowPanZoomTool(api, methods));
    tools.set('select', MXFlowSelectTool(api, methods));
    tools.set('drag', MXFlowDragTool(api, methods));
    tools.set('lasso', MXFlowLassoTool(api, methods));
    tools.set('linker', MXFlowLinkerTool(api, methods));
    tools.set('context', MXFlowContextTool(api, methods));
    tools.set('shortcut', MXFlowShortcutTool(api, methods));

    //Bind events
    dom.containerEl.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('pointerdown', handleDown);
    document.addEventListener('pointerup', handleUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('pointermove', handleMove);
    const dispose = () => {
        dom.containerEl.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('pointerdown', handleDown);
        document.removeEventListener('pointerup', handleUp);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        tools.forEach(tool => tool.dispose?.());
        renderCache.clear();
    }

    //Return public facing api
    return <const> {
        on<K extends keyof FlowTypes.FlowEventMap>(type: K, listener: (event: FlowTypes.FlowEventMap[K]) => any){
            events.on(type, listener);
        },
        removeListener<K extends keyof FlowTypes.FlowEventMap>(type: K, listener: Listener){
            events.removeListener(type, listener);
        },
        dispose,
        setOptions,
        cancel,
        ...methods
    }
}

type MXFlowControllerInstance = ReturnType<typeof MXFlowController>;

export { MXFlowController, MXFlowControllerInstance };
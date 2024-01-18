import * as FlowTypes from 'types/flow.types.v2';
import { generateFlowEl, flatten, resolveProperty, assignProperty, DefaultNodeTemplate }  from './flow-util';
import { EventEmitter, Listener } from 'util/event-emitter';
import { getPublicInterface } from './methods';
import MXFlowSelectTool from './systems/select';
import MXFlowDragTool from './systems/drag';
import MXFlowLassoTool from './systems/lasso';
import MXFlowPanZoomTool from './systems/panzoom';
import MXFlowLinkerTool from './systems/linker';
import MXFlowContextTool from './systems/context';
import MXFlowShortcutTool from './systems/shortcut';
import InteractionEmitter from './interact';

//Creates internal state structure, passed to the various systems
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
        undo: [],
        redo: [],
        transform: {
            x: 0,
            y: 0,
            scale: 1
        }
    }
}

//Default options, must include ALL possible options as it is deep-merged w/ user options on init
const DefaultOpts: FlowTypes.Options = {
    nodeHTMLTemplate: DefaultNodeTemplate,
    width: 5000,
    height: 5000,
    zIndexStart: 100,
    showGrid: true,
    gridSize: 32,
    bezierWeight: 0.675,
    linkValidator: () => true,
    beforeLinkStart: () => true,
    beforeLinkEnd: () => true,
    beforeNodeRemoved: () => true,
    beforeEdgeRemoved: () => true,
    beforeLinkRemoved: () => true,
    renderContext: () => {},
    render: () => {},
    background: {
        type: 'dots',
        size: 32,
        radius: 0.4,
        html: ''
    },
    drag: {
        cancelSelector: '',
        handleSelector: '',
        gridX: 0,
        gridY: 0,
        latchThreshold: 5
    },
    select: {
        multiSelectEnabled: true
    },
    undo: {
        enabled: true,
        max: Infinity,
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
    lasso: {
        enabled: true
    },
    panzoom: {
        enabled: true,
        minScale: 0.5,
        maxScale: 2,
        scaleStep: .25,
        scale: 1,
        x: 0,
        y: 0
    },
    controls: {
        panButton: 0,
        panModifier: false,
        panOnWheel: false,
        panOnArrowKeys: true,
        zoomOnWheelModifier: false,
        zoomOnWheel: true,
        zoomOnPinch: true,
        zoomOnDoubleClick: false,
        selectButton: 0,
        multiSelectModifier: 'Shift',
        lassoModifier: 'Control',
        lassoButton: 0
    }
}

/**
 * Flattens and merges the user options with the default options, ensuring that all options are present.
 * 
 * @param opts 
 * @returns 
 */
const mergeDefaultOpts = (opts: FlowTypes.Options) : FlowTypes.Config => {
    let merged = {};
    let defaultFlat = flatten(DefaultOpts);
    for (let key in defaultFlat){
        assignProperty(key, merged, resolveProperty(key, opts) ?? resolveProperty(key, DefaultOpts))
    }
    return <FlowTypes.Config> merged;
}

function MXFlowController(targetEl: HTMLElement, options: FlowTypes.Options){
    let opts = mergeDefaultOpts(options); //merge({}, DefaultOpts, options);
    const dom = generateFlowEl(targetEl, opts);
    const state = getMXFlowState(dom);
    const events = new EventEmitter();``
    const tools = new Map<string, FlowTypes.ActionHandler>();
    const renderCache = new Map<string, Element | null>();

    //Internal event emitter. Passed to tool instances.
    const emit = <K extends keyof FlowTypes.FlowEventMap>(type: K, event?: FlowTypes.FlowEventMap[K]) => {
        events.emit(type, event);
    }

    //Methods to lock or unlock a specific tool. These are passed to tool instances only.
    let toolLock: FlowTypes.ActionHandler | false = false;
    const isLocked = (exceptTool?: string) => toolLock !== false && toolLock.name !== exceptTool;
    const unlock = () => toolLock = false;
    const lock = (toolName: string) => {
        if (!toolLock && tools.has(toolName)){
            toolLock = tools.get(toolName)!;
        }
    }

    //API and methods, passed to tool instances.
    const api: FlowTypes.Api = <const> { tools, opts, dom, state, emit, lock, unlock, isLocked, renderCache };
    const methods = getPublicInterface(api);
    const interactions = InteractionEmitter(api, methods);

    /**
     * Creates new option set and notifies all subsystems to update state\
     * 
     * TODO: There are many options which are difficult to change at runtime, will need to consider 
     * whether this method is feasible. For now, individual setters are provided for some options.
     * 
     * @param options 
     */
    // const setOptions = (options: FlowTypes.Options) => {
    //     opts = mergeDefaultOpts(options); //merge({}, DefaultOpts, options);
    //     api.opts = opts;
    //     tools.forEach(tool => tool.update?.(api));
    // }

    const setDragOptions = (grid: FlowTypes.DragOptions) => {
        opts.drag = { ...opts.drag, ...grid };
        api.opts = opts;
        tools.forEach(tool => tool.update?.(api));
    }

    /**
     * Notifies all subsystems to cancel active operation (linking, dragging, etc.)
     */
    const cancel = () => {
        tools.forEach(tool => tool.cancel?.());
    }

    //Add tools
    tools.set('select', MXFlowSelectTool(api, methods, interactions));
    if (api.opts.lasso?.enabled) tools.set('lasso', MXFlowLassoTool(api, methods, interactions));
    if (api.opts.panzoom?.enabled) tools.set('panzoom', MXFlowPanZoomTool(api, methods, interactions));
    tools.set('drag', MXFlowDragTool(api, methods, interactions));
    tools.set('linker', MXFlowLinkerTool(api, methods, interactions));
    tools.set('context', MXFlowContextTool(api, methods, interactions));
    tools.set('shortcut', MXFlowShortcutTool(api, methods));
    

    const dispose = () => {
        tools.forEach(tool => tool.dispose?.());
        interactions.dispose();
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
        setDragOptions,
        cancel,
        ...methods
    }
}

type MXFlowControllerInstance = ReturnType<typeof MXFlowController>;

export { MXFlowController, MXFlowControllerInstance };
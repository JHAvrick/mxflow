interface Rect {
    left: number,
    right: number,
    top: number,
    bottom: number
}

interface FlowDom {
    instanceId: string,
    containerEl: HTMLDivElement
    lassoEl: HTMLDivElement
    contextEl: HTMLDivElement
    rootEl: HTMLDivElement
    nodeContainerEl: HTMLDivElement
    linkContainerEl: SVGElement
    ghostLinkContainerEl: SVGElement
    ghostLinkEl: SVGPathElement
}

interface FlowState {
    /**
     * The singular "graph" item
     */
    root: Graph,
    /**
     * Entity collections
     */
    nodes: Map<string, Node>,
    edges: Map<string, Edge>,
    links: Map<string, Link>,
    /**
     * Preselection (for lasso tool) and selection collections
     */
    preselected: Map<string, SelectableItem>,
    selected: Map<string, SelectableItem>,
    /**
     * Whether the context menu is currently open
     */
    contextOpen: boolean,

    multi: boolean,
    undo: Action[],
    redo: Action[],
    transform: Transform
}

interface FlowInternalApi {
    opts: Options,
    dom: FlowDom,
    state: FlowState,
    setSelected: (selected: SelectableItem[] | Map<string, SelectableItem>) => void,
    addToSelection: (items: SelectableItem[]) => void,
    removeFromSelection: (keys: string[]) => void,
    emit: <K extends keyof FlowEventMap>(type: K, event?: FlowEventMap[K]) => void
}

interface TransformModel {
    scale: number,
    x: number,
    y: number
}

interface NodeModel {
    selected: boolean,
    x: number,
    y: number,
    data: Serializable
}

interface EdgeModel {
    nodeKey: string,
    edgeKey: string,
    groupKey: string,
    data: Serializable
}

interface LinkModel {
    selected: boolean,
    fromNode: string,
    fromEdge: string,
    toNode: string,
    toEdge: string,
    data: Serializable
}

interface Model {
    transform: TransformModel,
    nodes: { [key:string]: NodeModel },
    edges: { [key: string]: EdgeModel },
    links: { [key:string]: LinkModel }
}

type ContentModelItem = NodeModel | EdgeModel; //Model items whose actual items have content sections


interface Serializable {
    [key:string]: string | number | boolean | null | undefined | Serializable;
}

/**
 * ------------------------------------------------------------------------------------------------------
 * Drag Controller Types
 * ------------------------------------------------------------------------------------------------------
 */
interface Graph {
    key: 'graph',
    type: FlowItemType.Graph,
    el: HTMLElement
}

interface Node {
    type: FlowItemType.Node,
    key: string,
    /**
     * The template used to generate this node. This value is autopopulated based on the global
     * `nodeHTMLTemplate` option, but can be specified individually when creating a node.
     */
    template: string,
    /**
     * The outer node element
     */
    el: HTMLElement,
    /**
     * The container for rendered content
     */
    contentEl: HTMLElement,
    /**
     * Map of edge groups generated after tempalte parsing
     */
    edgeGroups: Map<string, EdgeGroup>,
    /**
     * The node's current position
     */
    x: number,
    y: number,
    z: number,
    /**
     * The node's offset position during a drag operation. Always zero unless
     * actively dragging.
     */
    deltaX: number,
    deltaY: number,
    /**
     * Container for any user-attached data for this node
     */
    data: Serializable
}

type AddNodeOptions = {
    x?: number,
    y?: number,
    edges?: { group: string, key: string }[],
    data?: Serializable
} & ActionExtendedOpts;

/**
 * Posssible positions for link to latch to edge
 */
enum LinkLatchPosition {
    TOP = 'top',
    RIGHT = 'right',
    LEFT = 'left',
    BOTTOM = 'bottom',
    CENTER = 'center'
}

interface EdgeGroup {
    groupKey: string,
    groupEl: HTMLUListElement,
    latchPos: LinkLatchPosition
}

interface Edge {
    type: FlowItemType.Edge,
    group: EdgeGroup,
    key: string, //The composite key
    nodeKey: string,
    edgeKey: string,
    el: HTMLElement,
    data: Serializable
}

type AddEdgeOptions = {
    data?: Serializable
} & ActionExtendedOpts;

interface Link {
    type: FlowItemType.Link,
    key: string, //The composite key
    fromNode: string,
    fromEdge: string,
    toNode: string,
    toEdge: string
    el: SVGGElement,
    innerEl: SVGPathElement,
    outerEl: SVGPathElement,
    labelEl: SVGTextPathElement,
    data: Serializable
    // fObject: SVGForeignObjectElement,
    // content: HTMLElement
}

type AddLinkOptions = {
    data?: Serializable
} & ActionExtendedOpts;

interface GhostLink {
    el: SVGElement,
    pathEl: SVGElement
}

interface LinkState {
    active: boolean,
    edgeRect: Rect | null,
    fromEdge: Edge | null
}

interface CreateLinkParams { 
    fromNode: string, 
    toNode: string, 
    fromEdge: string, 
    toEdge: string
}

/**
 * Graph entities
 */
type FlowItem = Graph | Node | Edge | Link; //All items

/**
 * Valid items for selection
 */
type SelectableItem = Node | Link; //Items which can be selected

/**
 * Valid target items for context menu
 */
type ContextTargetItem = Graph | Node | Edge | Link;

/**
 * Item types which have a renderable content section
 */
type RenderableType = 'node' | 'edge';
type RenderableItem = Node | Edge;
// enum RenderableType {
//     Node = 'node',
//     Edge = 'edge',
//     //Context = 'context'
// }

enum FlowItemType {
    None = 'none',
    Graph = 'graph',
    Link = 'link',
    Node = 'node',
    Edge = 'edge'
}

/**
 * The data attribute keys applied to all graph entities
 */
enum FlowAttr {
    Type = 'data-mxflow-type',
    Key = 'data-mxflow-key',
    NodeTemplate = 'data-mxflow-node-template',
    NodeContent = 'data-mxflow-node-content',
    EdgeGroup = 'data-mxflow-edge-group',
    EdgeLatch = 'data-mxflow-edge-latch'
}

enum FlowClass {
    Container = 'mxflow-container',
    Root = 'mxflow-root',
    Grid = 'mxflow-grid',
    GridInner = 'mxflow-grid-inner',
    GridOuter = 'mxflow-grid-outer',
    Context = 'mxflow-context',
    ItemSelected = 'mxflow-item--selected',
    ItemPreselected = 'mxflow-item--preselected',
    Nodes = 'mxflow-nodes',
    Node = 'mxflow-node',
    NodeContent = 'mxflow-node-content',
    EdgeGroup = 'mxflow-edge-group',
    Edge = 'mxflow-edge',
    EdgeValid = 'mxflow-edge--valid',
    EdgeInvalid = 'mxflow-edge--invalid',
    Lasso = 'mxflow-lasso',
    Links = 'mxlflow-links',
    Link = 'mxflow-link',
    LinkInner = 'mxflow-link-inner',
    LinkOuter = 'mxflow-link-outer',
    LinkValid = 'mxflow-link--valid',
    LinkInvalid = 'mxflow-link--invalid',
    GhostLinks = 'mxflow-ghost-links',
    GhostLink = 'mxflow-ghost-link',
}

/**
 * Graph transform state, part of the larger state object
 */
interface Transform {
    scale: number,
    x: number,
    y: number
}

/**
 * Persistable action types used for do/undo. These types are used to 
 * define which actions should be recorded in the main options.
 */
type ActionType = typeof ActionTypes[keyof typeof ActionTypes];
const ActionTypes = <const> {
    TRANSFORM: 'transform',
    SELECT: 'select',
    DRAG: 'drag',
    ADD_EDGE: 'addEdge',
    REMOVE_EDGE: 'removeEdge',
    ADD_NODE: 'addNode',
    REMOVE_NODE: 'removeNode',
    ADD_LINK: 'addLink',
    REMOVE_LINK: 'removeLink',
    REMOVE_ITEMS: 'removeItems',
    CLEAR: 'clear',
    CUSTOM: 'custom'
}

/**
 * An graph action instance
 */
interface Action {
    type: ActionType,
    description?: string,
    model: Model
}

/**
 * Options for the `drag` system
 */
interface DragOptions {
    /**
     * Selector to cancel drag. Define a selector (class, data attribute, etc.) and apply
     * it to any elements within a node which should not trigger a drag operation. This setting
     * overrides the `handleSelector` setting. No value by default.
     */
    cancelSelector?: string,
    /**
     * Selector for the drag "handle" i.e. spot where dragging may occur. No value by default.
     */
    handleSelector?: string,
    /**
     * Grid X, any value zero or below will disable the grid on the x axis. Default is `0`.
     */
    gridX?: number,
    /**
     * Grid Y, any value zero or below will disable the grid on the x axis. Default is `0`.
     */
    gridY?: number,
    /**
     * Number of pixels a drag operation must move before considered `latched`. The `drag` action
     * is not recorded and `drag` event not emitted until latch. Default is `5`.
     */
    latchThreshold?: number
}

/**
 * Options for the `select`
 */
interface SelectOptions {
    /**
     * Which button code (PointerEvent) should trigger a select action
     */
    button: number,
    /**
     * When set to true (default) multiple items can be selected. Note that
     * this only affects "shift+click" type operations. There are other ways to select multiple
     * items which are unaffected (lasso tool, manually selecting items via `setSelected`).
     */
    allowMultiselect?: boolean,
    /**
     * The "key" (on KeyboardEvent) which triggers a multiselect state. Be sure that your letter casing is correct. 
     * Defaults to `Shift`.
     */
    multiSelectKey?: string
}

/**
 * Do/undo options
 */
interface UndoOptions {
    /**
     * Whether undo is enabled at all.
     */
    enabled?: boolean,
    /**
     * Max number of actions to record. A large number of actions can have a significant memory footprint
     * for complex graphs. Default is `50`.
     */
    max?: number,
    /**
     * An array of action types which can be undone. By default, most actions are recorded. If overriding, be
     * sure to include ALL action types you which to be undoable.
     * 
     */
    actions?: ActionType[]
}

interface LassoOptions {
    enabled: boolean,
}

/**
 * Options for the `panzoom` system
 */
interface PanZoomOptions {
    /**
     * The initial x position of the viewport
     */
    x?: number,
    /**
     * The initial y position of the viewport
     */
    y?: number,
    /**
     * The initial scale
     */
    scale?: number,
    /**
     * The smallest scale allowed (zoom out)
     */
    minScale?: number,
    /**
     * The largest scale allowed (zoom in)
     */
    maxScale?: number,
    /**
     * Step amount when zooming in or out
     */
    scaleStep?: number,
    /**
     * The CSS cursor icon to use when panning
     */
    panCursor?: "grab",
    /**
     * Control customization
     */
    controls?: {
        /**
         * Which button code (PointerEvent) should trigger a pan action
         */
        panButton?: number
    }
}

/**
 * Main options
 */
interface Options {
    model?: Model,
    /**
     * Whether to show the background grid or not. Default is `true`.
     * 
     */
    showGrid?: boolean,
    /**
     * If background grid is visible, the size of each (tiniest) square. Default is `32`.
     */
    gridSize?: number,
    /**
     * The start z-index for all flow items and elements.
     */
    zIndexStart?: number, //Base z-index
    /**
     * An HTML string template defining the basic layout for each node. 
     * This is for the layout or "shell" only. No decoration should be included here.
     */
    nodeHTMLTemplate?: string,
    /**
     * Curve weighting for edge linkers. Default it `0.675`.
     */
    bezierWeight?: number,
    /**
     * Options for the 'drag' tool.
     */
    drag?: DragOptions,
    /**
     * Options for "select" tool.
     */
    select?: SelectOptions,
    /**
     * Options for do/undo capabilites 
     */
    undo?: UndoOptions,
    /**
     * Options for the "panzoom" tool.
     */
    panzoom?: PanZoomOptions,
    /**
     * Options for the "lasso" tool.
     */
    lasso?: LassoOptions,
    /**
     * The render method. When using VanillaJS, this is the method from which the
     * user can insert their HTML content into each node and edge. The user must keep
     * track of HTML content externally as many operations will destroy an items's 
     * content section.
     */
    render?: (item: RenderableItem, content: Element | null | undefined, data: { [key:string]: any }) => Element | string | void,
    /**
     * The render method for the context menu. 
     */
    renderContext?: (item: FlowItem) => Element | string | void,
    /**
     * Custom link validator. This validator will be called repeatedly when a "linking"
     * operation is occurring and then once before a final link is formed. Don't perform any
     * heavy processing in this method.
     */
    linkValidator?: (startEdge: Edge, endEdge: Edge) => boolean,
    /**
     * Callback when a "down" event occurs on an edge and a "linking" operation begins. 
     * Return true to continue or false to cancel.
     */
    beforeLinkStart?: (startEdge: Edge) => boolean,
    /**
     * Callback when an "up" event occurs on a valid edge and the "linking" operation end. 
     * Return true to continue or false to cancel.
     */
    beforeLinkEnd?: (startEdge: Edge, endEdge: Edge) => boolean,
    /**
     * Called before a link is removed. Return true to continue or false to cancel.
     */
    beforeLinkRemoved?: (link: Link) => boolean,
    /**
     * Called before a node is removed. Return true to continue or false to cancel.
     */
    beforeNodeRemoved?: (node: Node) => boolean,
    /**
     * Called before an edge is removed. Return true to continue or false to cancel.
     */
    beforeEdgeRemoved?: (edge: Edge) => boolean,
}

/**
 * Defines return value for internal system "plugin"
 */
interface ActionHandler {
    name: string,
    onDown?: (e: PointerEvent, item?: FlowItem) => void,
    onUp?: (e: PointerEvent, item?: FlowItem) => void,
    onMove?: (e: PointerEvent) => void,
    onKeyUp?: (e: KeyboardEvent) => void,
    onKeyDown?: (e: KeyboardEvent) => void,
    onContextMenu?: (e: MouseEvent, item?: FlowItem) => void,
    onUpdate?: (api: Api) => void,
    onCancel?: () => void,
    dispose?: () => void
}

/**
 * Internal graph API passed to subsystems, etc.
 */
interface Api {
    opts: Options,
    dom: FlowDom,
    state: FlowState,
    tools: Map<string, ActionHandler>,
    renderCache: Map<string, Element | null>,
    emit: <K extends keyof FlowEventMap>(type: K, event?: FlowEventMap[K]) => void,
    lock: (toolName: string) => void,
    unlock: () => void,
    isLocked: () => boolean
}

/**
 * Events emmitted and their parameters
 */
interface FlowEventMap {
    'transform': Transform,
    'preselected': Map<string, SelectableItem>,
    'selected': Map<string, SelectableItem>,
    'nodeAdded': Node,
    'nodeRemoved': Node,
    'linkAdded': Link,
    'linkRemoved': Link,
    'dragStart': Node[],
    'dragEnd': Node[],
    'contextOpened': ContextTargetItem,
    'contextClosed': ContextTargetItem,
    'edgeAdded': Edge,
    'edgeRemoved': Edge,
    'cleared': void,
    // 'modelChange': Model,
    //'batch:nodeAdded': Model,
}

/**
 * Extended parameters available for most actions (`addNode`, `deleteNode`) etc.
 */
interface ActionExtendedOpts {
    /**
     * Suppress any events normally triggered by this action
     */
    suppressEvent?: boolean,
    /**
     * Suppress any action persistence normally triggered by this action.
     * Useful when batching actions into a single operation.
     */
    ignoreAction?: boolean
}

type ZoomByStepOpts = {
    smooth?: boolean,
    steps: number
} & ActionExtendedOpts

type ZoomToScaleOpts = {
    smooth?: boolean,
    scale: number
} & ActionExtendedOpts


type InteractionEvent = {
    type: keyof InteractionEventMap,
    item: FlowItem | undefined,
    graphX: number,
    graphY: number,
    containerX: number,
    containerY: number,
    pageX: number,
    pageY: number,
    event: Event
}

interface InteractionEventMap {
    'contextmenu': InteractionEvent,
    'down': InteractionEvent,
    'up': InteractionEvent,
    'move': InteractionEvent,
    'keydown': InteractionEvent,
    'keyup': InteractionEvent,
    'wheel': InteractionEvent
}

export {
    Action,
    ActionExtendedOpts,
    ActionHandler,
    ActionType,
    ActionTypes,
    AddNodeOptions,
    AddEdgeOptions,
    AddLinkOptions,
    Api,
    ContentModelItem,
    CreateLinkParams,
    Edge,
    EdgeGroup,
    EdgeModel,
    FlowDom,
    FlowEventMap,
    FlowInternalApi,
    FlowItem,
    FlowAttr,
    FlowClass,
    FlowItemType,
    FlowState,
    GhostLink,
    Graph,
    Link,
    LinkModel,
    LinkLatchPosition,
    LinkState,
    Model,
    Node,
    NodeModel,
    Options,
    PanZoomOptions,
    Rect,
    RenderableType,
    SelectableItem,
    SelectOptions,
    Transform,
    TransformModel,
    RenderableItem,
    ZoomByStepOpts,
    ZoomToScaleOpts,
    InteractionEvent,
    InteractionEventMap,
    Serializable
}

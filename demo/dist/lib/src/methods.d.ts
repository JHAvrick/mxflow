import * as FlowTypes from 'types/flow.types.v2';
type FlowMethods = ReturnType<typeof getPublicInterface>;
declare const getPublicInterface: (api: FlowTypes.Api) => {
    recordAction: (action: FlowTypes.ActionType) => void;
    undo: () => void;
    redo: () => void;
    addEdge: (group: string, nodeKey: string, edgeKey: string, opts?: FlowTypes.AddEdgeOptions) => FlowTypes.Edge;
    removeEdge: (key: string, opts?: FlowTypes.ActionExtendedOpts) => void;
    addNode: (nodeKey: string, options?: FlowTypes.AddNodeOptions) => void;
    removeNode: (key: string, opts?: FlowTypes.ActionExtendedOpts) => void;
    addLink: (fromNode: string, fromEdge: string, toNode: string, toEdge: string, opts?: FlowTypes.AddLinkOptions) => void;
    removeLink: (key: string, opts?: FlowTypes.ActionExtendedOpts) => void;
    isLinkValid: (fromEdge: FlowTypes.Edge, toEdge: FlowTypes.Edge) => boolean;
    isSelected: (item: FlowTypes.SelectableItem | string) => boolean;
    setSelected: (selected: FlowTypes.SelectableItem[] | Map<string, FlowTypes.SelectableItem>, opts?: FlowTypes.ActionExtendedOpts) => void;
    setPreselected: (preselected: FlowTypes.SelectableItem[] | Map<string, FlowTypes.SelectableItem>, opts?: Pick<FlowTypes.ActionExtendedOpts, 'suppressEvent'>) => void;
    addToSelection: (items: FlowTypes.SelectableItem[], opts?: FlowTypes.ActionExtendedOpts) => void;
    removeFromSelection: (keys: string[], opts?: FlowTypes.ActionExtendedOpts) => void;
    removeItem: (type: FlowTypes.FlowItemType, key: string, opts?: FlowTypes.ActionExtendedOpts) => void;
    removeSelectedItems: (opts?: FlowTypes.ActionExtendedOpts) => void;
    openContextMenu: (graphX: number, graphY: number, target: FlowTypes.FlowItem, opts?: {
        suppressEvent: boolean;
    }) => void;
    closeContextMenu: (opts?: {
        suppressEvent: boolean;
    }) => void;
    getItem: (type?: string | null, key?: string | null) => FlowTypes.FlowItem | undefined;
    resolveItem: (e: PointerEvent | MouseEvent) => FlowTypes.FlowItem | undefined;
    clear: (opts?: FlowTypes.ActionExtendedOpts) => void;
    getModel: () => FlowTypes.Model;
    setModel: (model: FlowTypes.Model) => Promise<unknown>;
    getDom: () => FlowTypes.FlowDom;
    getState: () => FlowTypes.FlowState;
    getNodes: () => Map<string, FlowTypes.Node>;
    getEdges: () => Map<string, FlowTypes.Edge>;
    getLinks: () => Map<string, FlowTypes.Link>;
    eventInGraph: (e: {
        target: EventTarget | null;
    }) => boolean;
    pageToContainerPos: (graphX: number, graphY: number) => number[];
    pageToGraphPos: (pageX: number, pageY: number) => number[];
    setView: (opts: FlowTypes.SetViewOptions) => void;
    focusNode: (node: FlowTypes.Node, scale?: number) => void;
    render: (item: FlowTypes.RenderableItem, data?: {
        [key: string]: any;
    }) => void;
    renderAll: (data?: {
        [key: string]: any;
    }) => void;
    getCompositeScale: () => number;
    setBackground: (html: string) => void;
};
export { getPublicInterface, FlowMethods };

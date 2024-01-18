import * as FlowTypes from 'types/flow.types.v2';
declare type FlowMethods = ReturnType<typeof getPublicInterface>;
declare const getPublicInterface: (api: FlowTypes.Api) => {
    recordAction: (action: FlowTypes.ActionType) => void;
    undo: () => void;
    redo: () => void;
    addEdge: (group: string, nodeKey: string, edgeKey: string, opts?: FlowTypes.AddEdgeOptions | undefined) => FlowTypes.Edge;
    removeEdge: (key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    addNode: (nodeKey: string, options?: FlowTypes.AddNodeOptions) => void;
    removeNode: (key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    addLink: (fromNode: string, fromEdge: string, toNode: string, toEdge: string, opts?: FlowTypes.AddLinkOptions | undefined) => void;
    removeLink: (key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    isLinkValid: (fromEdge: FlowTypes.Edge, toEdge: FlowTypes.Edge) => boolean;
    isSelected: (item: FlowTypes.SelectableItem | string) => boolean;
    setSelected: (selected: FlowTypes.SelectableItem[] | Map<string, FlowTypes.SelectableItem>, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    setPreselected: (preselected: FlowTypes.SelectableItem[] | Map<string, FlowTypes.SelectableItem>, opts?: Pick<FlowTypes.ActionExtendedOpts, "suppressEvent"> | undefined) => void;
    addToSelection: (items: FlowTypes.SelectableItem[], opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    removeFromSelection: (keys: string[], opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    removeItem: (type: FlowTypes.FlowItemType, key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    removeSelectedItems: (opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    openContextMenu: (graphX: number, graphY: number, target: FlowTypes.FlowItem, opts?: {
        suppressEvent: boolean;
    } | undefined) => void;
    closeContextMenu: (opts?: {
        suppressEvent: boolean;
    } | undefined) => void;
    getItem: (type?: string | null | undefined, key?: string | null | undefined) => FlowTypes.FlowItem | undefined;
    resolveItem: (e: PointerEvent | MouseEvent) => FlowTypes.FlowItem | undefined;
    clear: (opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
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
    focusNode: (node: FlowTypes.Node, scale?: number | undefined) => void;
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

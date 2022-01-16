import * as FlowTypes from 'types/flow.types.v2';
declare const getPublicInterface: (api: FlowTypes.Api) => {
    recordAction: (action: FlowTypes.ActionType) => void;
    undo: () => void;
    redo: () => void;
    addEdge: (group: string, nodeKey: string, edgeKey: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => FlowTypes.Edge;
    removeEdge: (key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    setEdgeContent: (nodeKey: string, edgeKey: string, content: HTMLElement | string) => never;
    addNode: (nodeKey: string, options?: FlowTypes.AddNodeOptions) => void;
    removeNode: (key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    setNodeContent: (nodeKey: string, content: HTMLElement | string) => never;
    addLink: (fromNode: string, fromEdge: string, toNode: string, toEdge: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    removeLink: (key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    isLinkValid: (fromEdge: FlowTypes.Edge, toEdge: FlowTypes.Edge) => boolean;
    isSelected: (item: FlowTypes.SelectableItem | string) => boolean;
    setSelected: (selected: FlowTypes.SelectableItem[] | Map<string, FlowTypes.SelectableItem>, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    addToSelection: (items: FlowTypes.SelectableItem[], opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    removeFromSelection: (keys: string[], opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    removeItem: (type: FlowTypes.FlowItemType, key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    removedSelectedItems: () => void;
    openContextMenu: (x: number, y: number, target: FlowTypes.FlowItem, opts?: {
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
    getNodes: () => Map<string, FlowTypes.Node>;
    getEdges: () => Map<string, FlowTypes.Edge>;
    getLinks: () => Map<string, FlowTypes.Link>;
};
export { getPublicInterface };

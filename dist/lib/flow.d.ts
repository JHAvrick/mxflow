import * as FlowTypes from 'types/flow.types.v2';
import { Listener } from 'util/event-emitter';
declare function MXFlowController(targetEl: HTMLElement, options: FlowTypes.Options): {
    readonly recordAction: (action: FlowTypes.ActionType) => void;
    readonly undo: () => void;
    readonly redo: () => void;
    readonly addEdge: (group: string, nodeKey: string, edgeKey: string, opts?: FlowTypes.AddEdgeOptions | undefined) => FlowTypes.Edge;
    readonly removeEdge: (key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    readonly addNode: (nodeKey: string, options?: FlowTypes.AddNodeOptions) => void;
    readonly removeNode: (key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    readonly addLink: (fromNode: string, fromEdge: string, toNode: string, toEdge: string, opts?: FlowTypes.AddLinkOptions | undefined) => void;
    readonly removeLink: (key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    readonly isLinkValid: (fromEdge: FlowTypes.Edge, toEdge: FlowTypes.Edge) => boolean;
    readonly isSelected: (item: string | FlowTypes.SelectableItem) => boolean;
    readonly setSelected: (selected: Map<string, FlowTypes.SelectableItem> | FlowTypes.SelectableItem[], opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    readonly setPreselected: (preselected: Map<string, FlowTypes.SelectableItem> | FlowTypes.SelectableItem[], opts?: Pick<FlowTypes.ActionExtendedOpts, "suppressEvent"> | undefined) => void;
    readonly addToSelection: (items: FlowTypes.SelectableItem[], opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    readonly removeFromSelection: (keys: string[], opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    readonly removeItem: (type: FlowTypes.FlowItemType, key: string, opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    readonly removedSelectedItems: (opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    readonly openContextMenu: (graphX: number, graphY: number, target: FlowTypes.FlowItem, opts?: {
        suppressEvent: boolean;
    } | undefined) => void;
    readonly closeContextMenu: (opts?: {
        suppressEvent: boolean;
    } | undefined) => void;
    readonly getItem: (type?: string | null | undefined, key?: string | null | undefined) => FlowTypes.FlowItem | undefined;
    readonly resolveItem: (e: PointerEvent | MouseEvent) => FlowTypes.FlowItem | undefined;
    readonly clear: (opts?: FlowTypes.ActionExtendedOpts | undefined) => void;
    readonly getModel: () => FlowTypes.Model;
    readonly setModel: (model: FlowTypes.Model) => Promise<unknown>;
    readonly getDom: () => FlowTypes.FlowDom;
    readonly getState: () => FlowTypes.FlowState;
    readonly getNodes: () => Map<string, FlowTypes.Node>;
    readonly getEdges: () => Map<string, FlowTypes.Edge>;
    readonly getLinks: () => Map<string, FlowTypes.Link>;
    readonly eventInGraph: (e: {
        target: EventTarget | null;
    }) => boolean;
    readonly pageToContainerPos: (graphX: number, graphY: number) => number[];
    readonly pageToGraphPos: (pageX: number, pageY: number) => number[];
    readonly setView: (opts: FlowTypes.SetViewOptions) => void;
    readonly focus: (node: FlowTypes.Node, scale?: number | undefined) => void;
    readonly render: (item: FlowTypes.RenderableItem, data?: {
        [key: string]: any;
    }) => void;
    readonly renderAll: (data?: {
        [key: string]: any;
    }) => void;
    readonly getCompositeScale: () => number;
    readonly on: <K extends keyof FlowTypes.FlowEventMap>(type: K, listener: (event: FlowTypes.FlowEventMap[K]) => any) => void;
    readonly removeListener: <K_1 extends keyof FlowTypes.FlowEventMap>(type: K_1, listener: Listener) => void;
    readonly dispose: () => void;
    readonly setOptions: (options: FlowTypes.Options) => void;
    readonly cancel: () => void;
};
declare type MXFlowControllerInstance = ReturnType<typeof MXFlowController>;
export { MXFlowController, MXFlowControllerInstance };

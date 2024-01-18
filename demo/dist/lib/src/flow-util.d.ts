import * as FlowTypes from 'types/flow.types.v2';
/**
 * Generates a curved SVG bezier path. The severity of the curve is controlled by the weight parameter.
 *
 * See https://codepen.io/GrinninColossus/pen/PopzzNE?editors=1010
 */
declare const getBezierPath: (x1: number, y1: number, x2: number, y2: number, weight: number) => string;
declare const swapValues: <T>(var1: T, var2: T) => [T, T];
/**
 * Clone simpe objects
 */
declare const clone: (obj: Object) => any;
/**
 * Clamp value between min/max
 */
declare const clamp: (num: number, min: number, max: number) => number;
/**
 * Get distance between two points.
 */
declare const distance: (x1: number, y1: number, x2: number, y2: number) => number;
/**
 * Creates a simple throttled function
 */
declare const throttle: (callback: Function, limit: number) => (...args: any[]) => void;
/**
 * Get midpoint between two points
 */
declare const midpoint: (x1: number, y1: number, x2: number, y2: number) => number[];
declare const flatten: (obj: {
    [key: string]: any;
    [key: number]: any;
}, roots?: string[], sep?: string) => {
    [key: string]: any;
    [key: number]: any;
};
/**
 * Resolve a property on an object using an accessor string.
 */
declare const resolveProperty: (path: string, obj: {
    [key: string]: any;
}) => {
    [key: string]: any;
};
/**
 * Assigns value to property using accessor string. If the given path does not exist,
 * it is created.
 */
declare const assignProperty: (path: string, obj: {
    [key: string]: any;
    [key: number]: any;
}, val: any) => void;
declare type rect = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};
/**
 * Determines whether to rects intersect
 *
 * @param r1
 * @param r2
 * @returns
 */
declare const intersectRect: (r1: rect, r2: rect) => boolean;
declare const DefaultNodeTemplate: string;
declare const parseNodeTemplate: (template: string) => [Document, HTMLElement, HTMLElement];
declare type CreateNodeOptions = {
    template?: string;
    key: string;
    x: number;
    y: number;
    z: number;
    width?: string | number;
    height?: string | number;
    nodeClass?: string | string[];
    data?: FlowTypes.Serializable;
};
declare const createNode: (opts: CreateNodeOptions) => FlowTypes.Node;
declare const getEdgeCompositeKey: (edge: FlowTypes.Edge) => string;
declare const createEdge: (node: FlowTypes.Node, groupKey: string, edgeKey: string, edgeClass?: string | undefined) => FlowTypes.Edge;
/**
 * Given an edge, returns it's latch position as defined by its edge group.
 *
 * @param edge - The target Edge
 * @param offsetX - X axis offset to factor in
 * @param offsetY - Y axis offset to factor in
 * @returns
 */
declare const getEdgeLatchPos: (edge: FlowTypes.Edge, offsetX?: number, offsetY?: number) => {
    x: number;
    y: number;
};
declare const getLinkCompositeKey: (opts: FlowTypes.CreateLinkParams) => string;
declare const createLink: (opts: FlowTypes.CreateLinkParams, groupClass?: string | undefined) => FlowTypes.Link;
declare const generateFlowEl: (targetEl: HTMLElement, opts: FlowTypes.Config) => {
    instanceId: string;
    containerEl: HTMLDivElement;
    lassoEl: SVGElement;
    contextEl: HTMLDivElement;
    rootEl: HTMLDivElement;
    bgEl: HTMLDivElement;
    nodeContainerEl: HTMLDivElement;
    linkContainerEl: SVGElement;
    ghostLinkContainerEl: SVGElement;
    ghostLinkEl: SVGPathElement;
};
declare const addItemClass: (item: FlowTypes.FlowItem | FlowTypes.FlowItem[] | Map<string, FlowTypes.FlowItem>, c: string) => void;
declare const removeItemClass: (item: FlowTypes.FlowItem | FlowTypes.FlowItem[] | Map<string, FlowTypes.FlowItem>, c: string) => void;
declare const applyNodePosition: (node: FlowTypes.Node) => FlowTypes.Node;
declare const applyLinkPosition: (api: FlowTypes.Api, link: FlowTypes.Link) => void;
declare const applyAllLinkPositions: (api: FlowTypes.Api) => void;
export { swapValues, clone, clamp, distance, midpoint, throttle, flatten, resolveProperty, assignProperty, getBezierPath, intersectRect, DefaultNodeTemplate, parseNodeTemplate, createNode, getEdgeCompositeKey, getLinkCompositeKey, createEdge, getEdgeLatchPos, createLink, generateFlowEl, addItemClass, removeItemClass, applyNodePosition, applyLinkPosition, applyAllLinkPositions };

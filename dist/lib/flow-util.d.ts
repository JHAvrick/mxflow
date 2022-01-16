import * as FlowTypes from 'types/flow.types.v2';
/**
 * Generates a curved SVG bezier path. The severity of the curve is controlled by the weight parameter.
 *
 * See https://codepen.io/GrinninColossus/pen/PopzzNE?editors=1010
 */
declare const getBezierPath: (x1: number, y1: number, x2: number, y2: number, weight: number) => string;
interface rect {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
/**
 * Determines whether to rects intersect
 *
 * @param r1
 * @param r2
 * @returns
 */
declare const intersectRect: (r1: rect, r2: rect) => boolean;
declare const createNode: (key: string, x: number, y: number, template?: string) => FlowTypes.Node;
declare const getEdgeCompositeKey: (edge: FlowTypes.Edge) => string;
declare const createEdge: (node: FlowTypes.Node, groupKey: string, edgeKey: string) => FlowTypes.Edge;
declare const getEdgeOffsetCenter: (edge: FlowTypes.Edge) => {
    x: number;
    y: number;
};
declare const getLinkCompositeKey: (opts: FlowTypes.CreateLinkParams) => string;
declare const createLink: (opts: FlowTypes.CreateLinkParams) => FlowTypes.Link;
declare const generateFlowEl: (targetEl: HTMLElement, opts: FlowTypes.Options) => {
    containerEl: HTMLDivElement;
    lassoEl: HTMLDivElement;
    contextEl: HTMLDivElement;
    rootEl: HTMLDivElement;
    nodeContainerEl: HTMLDivElement;
    linkContainerEl: SVGElement;
    ghostLinkContainerEl: SVGElement;
    ghostLinkEl: SVGPathElement;
};
declare const addSelectionClasses: (item: FlowTypes.FlowItem) => void;
declare const removeSelectionClasses: (item: FlowTypes.FlowItem) => void;
declare const applyNodePosition: (node: FlowTypes.Node) => FlowTypes.Node;
declare const applyLinkPosition: (api: FlowTypes.Api, link: FlowTypes.Link) => void;
declare const applyAllLinkPositions: (api: FlowTypes.Api) => void;
export { getBezierPath, intersectRect, createNode, getEdgeCompositeKey, getLinkCompositeKey, createEdge, getEdgeOffsetCenter, createLink, generateFlowEl, addSelectionClasses, removeSelectionClasses, applyNodePosition, applyLinkPosition, applyAllLinkPositions };

import * as FlowTypes from 'types/flow.types.v2';
import generateBackground from './helpers/background';

/**
 * Generates a curved SVG bezier path. The severity of the curve is controlled by the weight parameter.
 * 
 * See https://codepen.io/GrinninColossus/pen/PopzzNE?editors=1010
 */
const getBezierPath = (x1: number, y1: number, x2: number, y2: number, weight: number) => {
    let dx = Math.abs(x2 - x1) * weight;
    let bx2 = Math.max(x1, x2) - dx;
    var bx3 = Math.min(x1, x2) + dx;
    return `M${x1} ${y1} C ${bx2} ${y1} ${bx3} ${y2} ${x2} ${y2}`
}

const swapValues = (var1: any, var2: any) => {
    let t = var1;
    var1 = var2;
    var2 = t;
    return [var1, var2];
}

/**
 * Clone simpe objects
 */
const clone = (obj: Object) => JSON.parse(JSON.stringify(obj));

/**
 * Clamp value between min/max
 */
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

/**
 * Get distance between two points.
 */
const distance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
}

/**
 * Creates a simple throttled function
 */
const throttle = (callback: Function, limit: number) => {
    var waiting = false;
    return function (...args: any[]) {
        if (!waiting) {       
            callback(...args);
            waiting = true;
            setTimeout(function () {
                waiting = false; 
            }, limit);
        }
    }
}

/**
 * Get midpoint between two points
 */
const midpoint = (x1: number, y1: number, x2: number, y2: number) => {
	return [(x1 + x2) / 2, (y1 + y2) / 2];
}


const flatten = (obj: { [key:string | number]: any }, roots: string[] = [], sep = '.') :  { [key:string | number]: any } => {
    return Object
        .keys(obj)
        .reduce((memo, prop) => Object.assign({}, memo,
            Object.prototype.toString.call(obj[prop]) === '[object Object]'
                // keep working if value is an object
                ? flatten(obj[prop], roots.concat([prop]), sep)
                // include current prop and value and prefix prop with the roots
                : { [roots.concat([prop]).join(sep)]: obj[prop] }
        ), {})
}

/**
 * Resolve a property on an object using an accessor string.
 */
const resolveProperty = (path: string, obj: { [key:string]: any }) => {
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, obj || self)
}

/**
 * Assigns value to property using accessor string. If the given path does not exist,
 * it is created.
 */
const assignProperty = (path: string, obj: { [key:string | number]: any }, val: any) => {
    let parts = path.split('.');
    for (let i = 0; i < parts.length - 1; i++){
        if (obj[parts[i]] == null || obj[parts[i]] == undefined) {
            obj[parts[i]] = {};
        }

        obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = val;
}

type rect = {
    left: number,
    right: number,
    top: number,
    bottom: number
}

/**
 * Determines whether to rects intersect
 * 
 * @param r1 
 * @param r2 
 * @returns 
 */
const intersectRect = (r1: rect, r2: rect) => {
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
}

const enumFromStringValue = <T>(enm: { [s: string]: T }, value: string): T | undefined => {
    return (Object.values(enm) as unknown as string[]).includes(value)
        ? value as unknown as T
        : undefined;
}

const DefaultNodeTemplate = /* HTML */ `
    <div ${FlowTypes.FlowAttr.NodeTemplate}>
        <ul ${FlowTypes.FlowAttr.EdgeGroup}="inputs" ${FlowTypes.FlowAttr.EdgeLatch}="left">
            <!-- Input Edges Dynamically Populated -->
        </ul>
        <div ${FlowTypes.FlowAttr.NodeContent}>
            <!-- Node Content as Provided by User -->
        </div>
        <ul ${FlowTypes.FlowAttr.EdgeGroup}="outputs" ${FlowTypes.FlowAttr.EdgeLatch}="right">
            <!-- Output Edges Dynamically Populated -->
        </ul>
    </div>
`

const buildEdgeGroups = (dom: Document) => {
    let edgeGroups: Map<string, FlowTypes.EdgeGroup> = new Map();
    let groupNodes = dom.querySelectorAll(`ul[${FlowTypes.FlowAttr.EdgeGroup}]`);
    groupNodes.forEach(node => {
        let key = node.getAttribute(FlowTypes.FlowAttr.EdgeGroup)!;
        let latchPos = enumFromStringValue(FlowTypes.LinkLatchPosition, node.getAttribute(FlowTypes.FlowAttr.EdgeLatch) ?? 'center');
        node.classList.add(FlowTypes.FlowClass.EdgeGroup);
        edgeGroups.set(key, {
            groupKey: key,
            groupEl: <HTMLUListElement>node,
            latchPos: latchPos ?? FlowTypes.LinkLatchPosition.CENTER
        })
    })

    return edgeGroups;
}

const parseNodeTemplate = (template: string): [Document, HTMLElement, HTMLElement] => {
    let dom = new DOMParser().parseFromString(template, "text/html");

    //Get and create node
    let el = dom.querySelector(`*[${FlowTypes.FlowAttr.NodeTemplate}]`);
    let content = dom.querySelector(`*[${FlowTypes.FlowAttr.NodeContent}]`);

    //Ensure all template elements have been included
    if (!el /*|| !inputs || !outputs */ || !content) {
        throw new Error('Node template is missing required element.');
    }

    //Ensure all template elements are of the correct type
    if (!(el instanceof HTMLElement) /* || !(inputs instanceof HTMLUListElement) || !(outputs instanceof HTMLUListElement) */ || !(content instanceof HTMLElement)) {
        throw new Error('One more more template elements is of the incorrect element type.');
    }

    return [dom, el, content];
}

const applyNodeAttributes = (el: HTMLElement, key: string, z: number) => {
    el.setAttribute(FlowTypes.FlowAttr.Type, FlowTypes.FlowItemType.Node);
    el.setAttribute(FlowTypes.FlowAttr.Key, key);
    el.setAttribute('draggable', "false");
    el.ondragstart = (e) => e.preventDefault();
    el.style.display = 'inline-flex';
    el.style.justifyContent = 'space-between';
    el.style.touchAction = 'none';
    el.style.userSelect = 'none';
    el.style.pointerEvents = 'all';
    el.style.position = 'absolute';
    el.style.left = "0px";
    el.style.top = "0px";
    el.style.zIndex = z.toString();
}

const FlowClasses = new Set<string>(Object.values(FlowTypes.FlowClass));
const copyFlowClasses = (from: Element, to: Element) => {
    from.classList.forEach(c => {
        if (FlowClasses.has(c)) {
            to.classList.add(c);
        }
    })
}

type CreateNodeOptions = {
    template?: string,
    key: string,
    x: number,
    y: number,
    z: number,
    width?: string | number,
    height?: string | number,
    nodeClass?: string,
    data?: FlowTypes.Serializable
}

const createNode = (opts: CreateNodeOptions): FlowTypes.Node => {
    let template = opts.template ?? DefaultNodeTemplate;
    let dom, el, content;[dom, el, content] = parseNodeTemplate(template);

    //Ensure all template elements have been included
    if (!el /*|| !inputs || !outputs */ || !content) {
        throw new Error('Node template is missing required element.');
    }

    //Ensure all template elements are of the correct type
    if (!(el instanceof HTMLElement) /* || !(inputs instanceof HTMLUListElement) || !(outputs instanceof HTMLUListElement) */ || !(content instanceof HTMLElement)) {
        throw new Error('One more more template elements is of the incorrect element type.');
    }

    if (el instanceof HTMLElement) {
        applyNodeAttributes(el, opts.key, opts.z);
    } else {
        throw new Error('No parent HTMLElement found in Node template (w/ class "mx-flow-node").');
    }

    el.classList.add(FlowTypes.FlowClass.Node);
    content.classList.add(FlowTypes.FlowClass.NodeContent);

    if (opts.nodeClass && opts.nodeClass.length > 0){
        el.classList.add(opts.nodeClass);
    }

    if (opts.width) el.style.width = typeof opts.width === 'number' ? `${opts.width}px` : opts.width;
    if (opts.height) el.style.height = typeof opts.height === 'number' ? `${opts.height}px` : opts.height;

    return {
        type: FlowTypes.FlowItemType.Node,
        template: template,
        key: opts.key,
        el: el,
        contentEl: content,
        edgeGroups: buildEdgeGroups(dom),
        x: opts.x,
        y: opts.y,
        z: opts.z,
        deltaX: 0,
        deltaY: 0,
        width: opts.width ?? 'auto',
        height: opts.height ?? 'auto',
        data: opts.data ?? {}
    }
}

const getEdgeCompositeKey = (edge: FlowTypes.Edge) => {
    return `${edge.nodeKey}:${edge.edgeKey}`;
}

const createEdge = (node: FlowTypes.Node, groupKey: string, edgeKey: string, edgeClass?: string): FlowTypes.Edge => {
    let group = node.edgeGroups.get(groupKey);
    if (!group) {
        throw new Error(`createEdge(): Unable to find group with key "${groupKey}" in node template.`);
    }

    let el = document.createElement('li');
        el.classList.add(FlowTypes.FlowClass.Edge);
        el.setAttribute(FlowTypes.FlowAttr.Type, FlowTypes.FlowItemType.Edge);
        el.setAttribute(FlowTypes.FlowAttr.Key, `${node.key}:${edgeKey}`);
        el.setAttribute('draggable', "false");
        el.ondragstart = (e) => e.preventDefault();

    if (edgeClass && edgeClass.length > 0){
        el.classList.add(edgeClass);
    }

    return {
        type: FlowTypes.FlowItemType.Edge,
        key: `${node.key}:${edgeKey}`,
        group: group,
        nodeKey: node.key,
        edgeKey: edgeKey,
        el: el,
        data: {}
    }
}

/**
 * Given an edge, returns it's latch position as defined by its edge group.
 * 
 * @param edge - The target Edge
 * @param offsetX - X axis offset to factor in
 * @param offsetY - Y axis offset to factor in
 * @returns 
 */
const getEdgeLatchPos = (edge: FlowTypes.Edge, offsetX: number = 0, offsetY: number = 0) => {
    let rect = edge.el.getBoundingClientRect();
    switch (edge.group.latchPos.toString()) {
        case 'top':
            return {
                x: (rect.left - offsetX) + (rect.width / 2),
                y: (rect.top - offsetY)
            }
        case 'right':
            return {
                x: (rect.left - offsetX) + rect.width,
                y: (rect.top - offsetY) + (rect.height / 2)
            }
        case 'bottom':
            return {
                x: (rect.left - offsetX) + (rect.width / 2),
                y: (rect.top - offsetY) + rect.height
            }
        case 'left':
            return {
                x: (rect.left - offsetX),
                y: (rect.top - offsetY) + (rect.height / 2)
            }
        case 'center':
        default:
            return {
                x: (rect.left - offsetX) + (rect.width / 2),
                y: (rect.top - offsetY) + (rect.height / 2)
            }
    }
}

const getLinkCompositeKey = (opts: FlowTypes.CreateLinkParams) => {
    return `${opts.fromNode}:${opts.fromEdge}:${opts.toNode}:${opts.toEdge}`;
}

const createLink = (opts: FlowTypes.CreateLinkParams, groupClass?: string): FlowTypes.Link => {
    let key = getLinkCompositeKey(opts);
    let inner = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        inner.classList.add(FlowTypes.FlowClass.LinkInner);
        inner.style.pointerEvents = 'none';

    let outer = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        outer.classList.add(FlowTypes.FlowClass.LinkOuter);
        outer.style.pointerEvents = 'auto';

    let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        text.textContent = 'Label';
        text.style.color = 'white';
        text.setAttribute('width', "300px");
        text.setAttribute('height', "300px");
        text.setAttribute('textAnchor', 'middle');

    let labelPath = document.createElementNS("http://www.w3.org/2000/svg", 'textPath');
        labelPath.style.pointerEvents = 'none';

    text.appendChild(labelPath);

    let group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        group.setAttribute(FlowTypes.FlowAttr.Type, FlowTypes.FlowItemType.Link);
        group.setAttribute(FlowTypes.FlowAttr.Key, key);
        group.classList.add(FlowTypes.FlowClass.Link);
        group.style.pointerEvents = 'none';
        group.setAttribute('draggable', "false");
        group.ondragstart = (e) => e.preventDefault();
        group.appendChild(inner);
        group.appendChild(outer);
        group.appendChild(text);

    if (groupClass && groupClass.length > 0){
        group.classList.add(groupClass);
    }

    return {
        type: FlowTypes.FlowItemType.Link,
        key: key,
        fromNode: opts.fromNode,
        fromEdge: opts.fromEdge,
        toNode: opts.toNode,
        toEdge: opts.toEdge,
        el: group,
        innerEl: inner,
        outerEl: outer,
        labelEl: labelPath,
        data: {}
    }
}

const generateFlowEl = (targetEl: HTMLElement, opts: FlowTypes.Config) => {
    let id = 'mxflow-instance-' + Date.now();
    let bg = opts.background.html;
    if (opts.background.type === 'grid' || opts.background.type === 'dots'){
        bg = generateBackground(opts.background.type, opts.background.size);
    }

    targetEl.insertAdjacentHTML('afterbegin', /* HTML */ `
        <div id="${id}" class="${FlowTypes.FlowClass.Container}"
            tabindex="1" 
            style="position:relative; display:block; width:100%; height:100%; overflow:hidden; pointer-events:auto; padding:0px; outline:none"
            ondragstart="event.preventDefault()">
            <svg style="position:absolute; left:0px; top:0px; width:100%; height:100%; pointer-events:none; padding: 0px; z-index:1000;">
                <rect class="${FlowTypes.FlowClass.Lasso}" 
                    ondragstart="event.preventDefault()"
                    style="position:absolute; display:none; z-index: 3; pointer-events:none;">
                </rect>
            </svg>

            <!-- <div class="${FlowTypes.FlowClass.Lasso}"
                ondragstart="event.preventDefault()"
                style="position:absolute; display:none; z-index: 3; pointer-events:none;">
            </div> -->
            <div class="${FlowTypes.FlowClass.Context}"
                ondragstart="event.preventDefault()"
                style="display:none; position:absolute; z-index: 10;">
                <!-- Context Menu Populated Here -->
            </div>
            <div class="${FlowTypes.FlowClass.Root}"
                ${FlowTypes.FlowAttr.Type}="graph"
                ${FlowTypes.FlowAttr.Key}="graph"
                ondragstart="event.preventDefault()"
                style="position:relative; height:${opts.height}px; width:${opts.width}px; pointer-events:auto; transform-origin: 0 0; touch-action: none;">

                <div class="${FlowTypes.FlowClass.Background}" style="width:100%;height:100%;display:${ opts.background.type === 'none' ? 'none' : 'block' };">
                    ${bg}
                </div>
                <svg class="${FlowTypes.FlowClass.Links}" 
                        ondragstart="event.preventDefault()"
                        style="position:absolute; left:0px; top:0px; width:100%; height:100%; pointer-events:none; padding: 0px;">
                        <!-- Links Populated Here -->
                </svg>
                <svg class="${FlowTypes.FlowClass.GhostLinks}" 
                     ondragstart="event.preventDefault()"
                     style="position:absolute; left:0px; top:0px; width:100%; height:100%; pointer-events:none; padding: 0px; z-index:1000;">
                     <g style="position:absolute; pointer-events:none; overflow:visible; ">
                        <path class="${FlowTypes.FlowClass.GhostLink}" style="display:none;"></path>
                     </g>
                </svg>
                <div class="${FlowTypes.FlowClass.Nodes}">
                    <!-- Nodes Populated Here -->
                </div>
            </div>
        </div>
    `)

    return {
        instanceId: id,
        containerEl: <HTMLDivElement>targetEl.querySelector("." + FlowTypes.FlowClass.Container)!,
        lassoEl: <SVGElement>targetEl.querySelector("." + FlowTypes.FlowClass.Lasso)!,
        contextEl: <HTMLDivElement>targetEl.querySelector("." + FlowTypes.FlowClass.Context)!,
        rootEl: <HTMLDivElement>targetEl.querySelector("." + FlowTypes.FlowClass.Root)!,
        nodeContainerEl: <HTMLDivElement>targetEl.querySelector("." + FlowTypes.FlowClass.Nodes),
        linkContainerEl: <SVGElement>targetEl.querySelector("." + FlowTypes.FlowClass.Links)!,
        ghostLinkContainerEl: <SVGElement>targetEl.querySelector("." + FlowTypes.FlowClass.GhostLinks)!,
        ghostLinkEl: <SVGPathElement>targetEl.querySelector("." + FlowTypes.FlowClass.GhostLink)!
    }
}


const addItemClass = (item: FlowTypes.FlowItem | FlowTypes.FlowItem[] | Map<string, FlowTypes.FlowItem>, c: string) => {
    switch (true) {
        case Array.isArray(item):
            (<FlowTypes.FlowItem[]>item).forEach(item => item.el.classList.add(c))
            break;
        case item instanceof Map:
            (<Map<string, FlowTypes.FlowItem>>item).forEach(item => item.el.classList.add(c));
            break;
        default:
            (<FlowTypes.FlowItem>item).el.classList.add(c);
    }
}

const removeItemClass = (item: FlowTypes.FlowItem | FlowTypes.FlowItem[] | Map<string, FlowTypes.FlowItem>, c: string) => {
    switch (true) {
        case Array.isArray(item):
            (<FlowTypes.FlowItem[]>item).forEach(item => item.el.classList.remove(c))
            break;
        case item instanceof Map:
            (<Map<string, FlowTypes.FlowItem>>item).forEach(item => item.el.classList.remove(c));
            break;
        default:
            (<FlowTypes.FlowItem>item).el.classList.remove(c);
    }
}

const applyNodePosition = (node: FlowTypes.Node): FlowTypes.Node => {
    node.el.style.transform = `translate(${node.x + node.deltaX}px, ${node.y + node.deltaY}px)`;
    return node;
}

function _getQBezierValue(t: number, p1: number, p2: number, p3: number) {
    var iT = 1 - t;
    return iT * iT * p1 + 2 * iT * t * p2 + t * t * p3;
}

function getQuadraticCurvePoint(startX: number, startY: number, cpX: number, cpY: number, endX: number, endY: number, position: number) {
    return {
        x: _getQBezierValue(position, startX, cpX, endX),
        y: _getQBezierValue(position, startY, cpY, endY)
    };
}

const applyLinkPosition = (api: FlowTypes.Api, link: FlowTypes.Link) => {
    let transform = api.state.transform;
    let fromEdge = api.state.edges.get(`${link.fromNode}:${link.fromEdge}`);
    let toEdge = api.state.edges.get(`${link.toNode}:${link.toEdge}`);
    if (!fromEdge || !toEdge) {
        throw new Error('MXFlow.applyLinkPosition(): Cannot apply link position for undefined edge');
    }

    // let fromEdgeRect = <DOMRect> fromEdge!.el.getBoundingClientRect();
    // let toEdgeRect = <DOMRect> toEdge!.el.getBoundingClientRect();

    let containerRect = api.dom.containerEl.getBoundingClientRect();
    let offsetY = containerRect.top;
    let offsetX = containerRect.left;

    let latchFrom = getEdgeLatchPos(fromEdge, offsetX, offsetY);
    let latchTo = getEdgeLatchPos(toEdge, offsetX, offsetY);
    let x1 = latchFrom.x;
    let y1 = latchFrom.y;
    let x2 = latchTo.x;
    let y2 = latchTo.y

    if (x1 > x2) {
        [x1, x2] = swapValues(x1, x2);
        [y1, y2] = swapValues(y1, y2);
    }

    //let centerY = Math.abs((y1 - transform.y) - (y2 - transform.y));


    /**
     * Get the center between the two Y positions
     */
    // let fObjectRect = link.fObject.getBoundingClientRect();
    // let fObjectOffsetX = fObjectRect.width / 2;
    // let fObjextOffsetY = fObjectRect.height / 2;

    // let minX = Math.min(x1, x2);
    // let maxX = Math.max(x1, x2);
    // let minY = Math.min(y1, y2);
    // let maxY = Math.max(y1, y2);
    // let centerY = minY + ((maxY - minY) / 2);
    // let centerX = minX + ((maxX - minX) / 2);

    // let center = getQuadraticCurvePoint(
    //     (x1 - transform.x) / transform.scale, 
    //     ((y1 - 50) - transform.y) / transform.scale, 
    //     .9,//((centerX - fObjectOffsetX) - transform.x) / transform.scale, 
    //     ((centerY - fObjextOffsetY) - transform.y) / transform.scale, 
    //     (x2 - transform.x) / transform.scale, 
    //     ((y2 - 50) - transform.y) / transform.scale, 
    //     .5
    // );

    //console.log(center.x, center.y);

    //console.log(getQuadraticCurvePoint(x1, y1, .675, .675, x2, y2, .5));

    let bezier = getBezierPath(
        (x1 - transform.x) / transform.scale,
        (y1 - transform.y) / transform.scale,
        (x2 - transform.x) / transform.scale,
        (y2 - transform.y) / transform.scale,
        api.opts.bezierWeight ?? 0.675
    );

    //Apply our bezier curve to both the inner and outer link elements
    link.outerEl.setAttribute('d', bezier);
    link.innerEl.setAttribute('d', bezier);
    link.labelEl.setAttribute('d', bezier);
    //console.log(link.innerEl.getBBox());
    // link.fObject.setAttribute('x', center.x + 'px');
    // link.fObject.setAttribute('Y', center.y + 'px');
    // link.fObject.style.transform = `translate(${center.x}px, ${center.y}px)`;
}

const applyAllLinkPositions = (api: FlowTypes.Api) => {
    api.state.links.forEach(link => applyLinkPosition(api, link));
}

export {
    swapValues,
    clone,
    clamp,
    distance,
    midpoint,
    throttle,
    flatten,
    resolveProperty,
    assignProperty,
    getBezierPath,
    intersectRect,
    parseNodeTemplate,
    createNode,
    getEdgeCompositeKey,
    getLinkCompositeKey,
    createEdge,
    getEdgeLatchPos,
    createLink,
    generateFlowEl,
    addItemClass,
    removeItemClass,
    applyNodePosition,
    applyLinkPosition,
    applyAllLinkPositions
}
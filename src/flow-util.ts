import * as FlowTypes from 'types/flow.types.v2';

/**
 * Generates a curved SVG bezier path. The severity of the curve is controlled by the weight parameter.
 * 
 * See https://codepen.io/GrinninColossus/pen/PopzzNE?editors=1010
 */
const getBezierPath = (x1: number, y1: number, x2: number, y2: number , weight: number) => {
    let dx = Math.abs(x2 - x1) * weight;
    let bx2 = Math.max(x1, x2) - dx;
    var bx3 = Math.min(x1, x2) + dx;
    return  `M${x1} ${y1} C ${bx2} ${y1} ${bx3} ${y2} ${x2} ${y2}`
}

const swapValues = (var1: any, var2: any) => {
    let t = var1;
    var1 = var2;
    var2 = t;
    return [var1, var2];
}

interface rect {
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

const enumFromStringValue = <T> (enm: { [s: string]: T}, value: string): T | undefined => {
    return (Object.values(enm) as unknown as string[]).includes(value)
      ? value as unknown as T
      : undefined;
}

const DefaultNodeTemplate = /* HTML */ `
    <div ${FlowTypes.FlowAttr.NodeTemplate}>
        <ul ${FlowTypes.FlowAttr.EdgeGroup}="inputs">
            <!-- Input Edges Dynamically Populated -->
        </ul>
        <div ${FlowTypes.FlowAttr.NodeContent}>
            <!-- Node Content as Provided by User -->
        </div>
        <ul ${FlowTypes.FlowAttr.EdgeGroup}="outputs">
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
            console.log(latchPos);
            node.classList.add(FlowTypes.FlowClass.EdgeGroup);
            edgeGroups.set(key, {
                groupKey: key,
                groupEl: <HTMLUListElement> node,
                latchPos: latchPos ?? FlowTypes.LinkLatchPosition.CENTER
            })
        })

    return edgeGroups;
}

const createNode = (key: string, x: number, y: number, template: string = DefaultNodeTemplate) : FlowTypes.Node => {
    let dom = new DOMParser().parseFromString(template, "text/html");

    //Get and create node
    let el = dom.querySelector(`*[${FlowTypes.FlowAttr.NodeTemplate}]`);
    let content = dom.querySelector(`*[${FlowTypes.FlowAttr.NodeContent}]`);

    //Ensure all template elements have been included
    if (!el /*|| !inputs || !outputs */ || !content){
        throw new Error('Node template is missing required element.');
    }

    //Ensure all template elements are of the correct type
    if (!(el instanceof HTMLElement) /* || !(inputs instanceof HTMLUListElement) || !(outputs instanceof HTMLUListElement) */ || !(content instanceof HTMLElement)){
        throw new Error('One more more template elements is of the incorrect element type.');
    }

    if (el instanceof HTMLElement){
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
    } else {
        throw new Error('No parent HTMLElement found in Node template (w/ class "mx-flow-node").');
    }

    el.classList.add(FlowTypes.FlowClass.Node);
    content.classList.add(FlowTypes.FlowClass.NodeContent);

    return {
        type: FlowTypes.FlowItemType.Node,
        key: key,
        el: el,
        contentEl: content,
        edgeGroups: buildEdgeGroups(dom),
        x: x,
        y: y,
        deltaX: 0,
        deltaY: 0,
    }
}

const getEdgeCompositeKey = (edge: FlowTypes.Edge) => {
    return `${edge.nodeKey}:${edge.edgeKey}`;   
}  

const createEdge = (node: FlowTypes.Node, groupKey: string, edgeKey: string) : FlowTypes.Edge => {
    let group = node.edgeGroups.get(groupKey);
    if (!group){
        throw new Error(`createEdge(): Unable to find group with key "${groupKey}" in node template.`);
    }

    let el = document.createElement('li');
        el.classList.add(FlowTypes.FlowClass.Edge);
        el.setAttribute(FlowTypes.FlowAttr.Type, FlowTypes.FlowItemType.Edge);
        el.setAttribute(FlowTypes.FlowAttr.Key, `${node.key}:${edgeKey}`);
        el.setAttribute('draggable', "false");
        el.ondragstart = (e) => e.preventDefault(); 

    return {
        type: FlowTypes.FlowItemType.Edge, 
        key: `${node.key}:${edgeKey}`,
        group: group,
        nodeKey: node.key,
        edgeKey: edgeKey,
        el: el
    }
}

const getEdgeLatchPos = (edge: FlowTypes.Edge, offsetX: number = 0, offsetY: number = 0) => {
    let rect = edge.el.getBoundingClientRect();
    switch (edge.group.latchPos.toString()){
        case 'top': 
            return {
                x: (rect.left - offsetX) + (rect.width / 2),
                y: (rect.top - offsetY)
            }
        case 'right':
            return {
                x: (rect.left - offsetX),
                y: (rect.top - offsetY) + (rect.height / 2)
            }
        case 'bottom':
            return {
                x: (rect.left - offsetX) + (rect.width / 2),
                y: (rect.top - offsetY) + rect.height
            }
        case 'left':
            return {
                x: (rect.left - offsetX) + rect.width,
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

const createLink = (opts: FlowTypes.CreateLinkParams) : FlowTypes.Link => {
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

    // let fObject = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
    //     fObject.classList.add('mx-flow-link-fobject');
    //     fObject.style.position = 'absolute';
    //     fObject.style.width = "100px";
    //     fObject.style.height = "25px";
    //     fObject.insertAdjacentHTML('afterbegin', `
    //         <body xmlns="http://www.w3.org/1999/xhtml">
    //             <div class="mx-flow-link-content"></div>
    //         </body>
    //     `)

    // let content = <HTMLDivElement> fObject.querySelector('.mx-flow-link-content')!;
    //     content.classList.add('mx-flow-link-content');
    //     content.style.color = 'white';
    //     content.textContent = 'TEST';
    //     fObject.appendChild(content);

    let group = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        group.setAttribute(FlowTypes.FlowAttr.Type, FlowTypes.FlowItemType.Link);
        group.setAttribute(FlowTypes.FlowAttr.Key, key);
        group.classList.add(FlowTypes.FlowClass.Link);
        group.style.pointerEvents = 'none';
        group.setAttribute('draggable', "false");
        group.ondragstart = (e) => e.preventDefault(); 
        group.appendChild(inner);
        group.appendChild(outer);
        //group.appendChild(fObject);
        group.appendChild(text);
        //group.appendChild(label);
        console.log(group);

        //console.log(fObject);

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
        labelEl: labelPath
        // fObject: fObject,
        // content: content
    }
}

const generateFlowEl = (targetEl: HTMLElement, opts: FlowTypes.Options) => {

    let gridSize = opts.gridSize || 32;
    let gridMacroSize = gridSize * 10;

    targetEl.insertAdjacentHTML('afterbegin', /* HTML */ `
        <div class="${FlowTypes.FlowClass.Container}"
            tabindex="1" 
            style="position:relative; display:block; width:100%; height:100%; overflow:hidden; pointer-events:auto; padding:0px; outline:none"
            ondragstart="event.preventDefault()">
            <div class="${FlowTypes.FlowClass.Lasso}"
                ondragstart="event.preventDefault()"
                style="position:absolute; display:none; z-index: 3; pointer-events:none;">
            </div>
            <div class="${FlowTypes.FlowClass.Context}"
                ondragstart="event.preventDefault()"
                style="display:none; position:absolute; z-index: 10;">
                <!-- Context Menu Populated Here -->
            </div>
            <div class="${FlowTypes.FlowClass.Root}"
                ${FlowTypes.FlowAttr.Type}="graph"
                ${FlowTypes.FlowAttr.Key}="graph"
                ondragstart="event.preventDefault()"
                style="position:relative; height:5000px; width:5000px; pointer-events:auto; transform-origin: 0 0; touch-action: none;">

                <svg class="${FlowTypes.FlowClass.Grid}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" 
                     style="position:absolute; top:0; left:0; pointer-events:none; opacity:.5; display:${opts.showGrid ? 'block' : 'none'};'">
                    <defs>
                        <pattern id="smallGrid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
                            <path class="${FlowTypes.FlowClass.GridInner}" d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" stroke="#273558" stroke-width="0.5"/>
                        </pattern>
                        <pattern id="grid" width="${gridMacroSize}" height="${gridMacroSize}" patternUnits="userSpaceOnUse">
                            <rect width="${gridMacroSize}" height="${gridMacroSize}" fill="url(#smallGrid)" />
                            <path class="${FlowTypes.FlowClass.GridOuter}" d="M ${gridMacroSize} 0 L 0 0 0 ${gridMacroSize}" fill="none" stroke="#273558" stroke-width="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
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

    console.log(FlowTypes.FlowClass.Container)

    return {
        containerEl: <HTMLDivElement> targetEl.querySelector("." + FlowTypes.FlowClass.Container)!,
        lassoEl: <HTMLDivElement> targetEl.querySelector("." + FlowTypes.FlowClass.Lasso)!,
        contextEl: <HTMLDivElement> targetEl.querySelector("." + FlowTypes.FlowClass.Context)!,
        rootEl: <HTMLDivElement> targetEl.querySelector("." + FlowTypes.FlowClass.Root)!,
        nodeContainerEl: <HTMLDivElement> targetEl.querySelector("." + FlowTypes.FlowClass.Nodes),
        linkContainerEl: <SVGElement> targetEl.querySelector("." + FlowTypes.FlowClass.Links)!,
        ghostLinkContainerEl: <SVGElement> targetEl.querySelector("." + FlowTypes.FlowClass.GhostLinks)!,
        ghostLinkEl: <SVGPathElement> targetEl.querySelector("." + FlowTypes.FlowClass.GhostLink)!
    }
}


const addItemClass = (item: FlowTypes.FlowItem | FlowTypes.FlowItem[] | Map<string, FlowTypes.FlowItem>, c: string) => {
    switch (true){
        case Array.isArray(item):
            (<FlowTypes.FlowItem[]> item).forEach(item => item.el.classList.add(c))
            break;
        case item instanceof Map:
            (<Map<string, FlowTypes.FlowItem>> item).forEach(item => item.el.classList.add(c));
            break;
        default:
            (<FlowTypes.FlowItem> item).el.classList.add(c);
    }
}

const removeItemClass = (item: FlowTypes.FlowItem | FlowTypes.FlowItem[] | Map<string, FlowTypes.FlowItem>, c: string) => {
    switch (true){
        case Array.isArray(item):
            (<FlowTypes.FlowItem[]> item).forEach(item => item.el.classList.remove(c))
            break;
        case item instanceof Map:
            (<Map<string, FlowTypes.FlowItem>> item).forEach(item => item.el.classList.remove(c));
            break;
        default:
            (<FlowTypes.FlowItem> item).el.classList.remove(c);
    }
}

const applyNodePosition = (node: FlowTypes.Node) : FlowTypes.Node => {
    node.el.style.transform = `translate(${node.x + node.deltaX}px, ${node.y + node.deltaY}px)`;
    return node;
}

function _getQBezierValue(t: number, p1: number, p2: number, p3: number) {
    var iT = 1 - t;
    return iT * iT * p1 + 2 * iT * t * p2 + t * t * p3;
}

function getQuadraticCurvePoint(startX: number, startY: number, cpX: number, cpY: number, endX: number, endY: number, position: number) {
    return {
        x:  _getQBezierValue(position, startX, cpX, endX),
        y:  _getQBezierValue(position, startY, cpY, endY)
    };
}

const applyLinkPosition = (api: FlowTypes.Api, link: FlowTypes.Link) => {
    let transform = api.state.transform;
    let fromEdge = api.state.edges.get(`${link.fromNode}:${link.fromEdge}`);
    let toEdge = api.state.edges.get(`${link.toNode}:${link.toEdge}`);
    if (!fromEdge ||!toEdge){
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

    if (x1 > x2){
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

const applyAllLinkPositions = (api: FlowTypes.Api) =>{
    api.state.links.forEach(link =>  applyLinkPosition(api, link));
}

export {
    swapValues,
    getBezierPath,
    intersectRect,
    createNode,
    getEdgeCompositeKey,
    getLinkCompositeKey,
    createEdge,
    getEdgeLatchPos,
    createLink,
    generateFlowEl,
    addItemClass,
    removeItemClass,
    // addSelectionClasses,
    // removeSelectionClasses,
    applyNodePosition,
    applyLinkPosition,
    applyAllLinkPositions
}
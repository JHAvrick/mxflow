import * as FlowTypes from 'types/flow.types.v2';
import * as InteractTypes from 'types/interact.types';
import { clamp, throttle } from '../flow-util';

const distance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
}

const midpoint = (x1: number, y1: number, x2: number, y2: number) => {
	return [(x1 + x2) / 2, (y1 + y2) / 2];
}

/**
 * MXFlow tool which handles lasso selection.
 */
function MXFlowPanZoomTool(api: FlowTypes.Api, methods: FlowTypes.Methods, interactions: InteractTypes.InteractionEmitter) : FlowTypes.ActionHandler {
    let controls = api.opts.controls;
    let opts = api.opts.panzoom;
    let state = api.state;
    let dom = api.dom;
    let transform = state.transform;
    let panning = false;
    let pinching = false;
    let width = api.opts.width; //dom. //dom.rootEl.getBoundingClientRect().width;
    let height = api.opts.height; //5000;//dom.rootEl.getBoundingClientRect().height;
    let deltaX = 0;
    let deltaY = 0;
    let panStartX = 0;
    let panStartY = 0;
    let maxDeltaBottom = 0;
    let maxDeltaRight = 0;
    //let lastMoveEvent: PointerEvent | null = null;
    // let startDiff: number = 0;
    // let pointer1: PointerEvent | null = null;
    // let pointer2: PointerEvent | null = null;
    // let pinchStartDistance = 0;

    // let canvasRect = dom.rootEl.getBoundingClientRect(); //Probably doesn't need to recalculated

    const update = (api: FlowTypes.Api) => {
        opts = api.opts.panzoom;
        state = api.state;
        dom = api.dom;
        transform = state.transform;
    }

    const isValidDragPan = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
        let modActive = controls.panModifier ? interactions.isModActive('panModifier') : true;
        return !api.isLocked() && e.isPrimary && item?.type === 'graph' /*&& opts.panFilter!(e) */ && modActive && (e.pointerType !== 'mouse' || e.button === controls.panButton);
    }

    const applyTransform = (transition: boolean = false) => {
        dom.rootEl.style.transition = transition ? 'transform .3s' : '';
        dom.rootEl.style.transform = `translate(${transform.x + deltaX}px, ${transform.y + deltaY}px) scale(${transform.scale})`;
    }
    
    const updateMaxDeltas = () => {
        /**
         * Calculate max deltas. Note: Can substitute canvas element rect width/height for this 
         * calculation `(api.opts.width * transform.scale)`. Not sure which is more performant, or concise.
         */
        let containerRect = dom.containerEl.getBoundingClientRect();
        maxDeltaRight = ( (api.opts.width * transform.scale) - (Math.abs(transform.x) + containerRect.width));
        maxDeltaBottom = ( (api.opts.height * transform.scale)  - (Math.abs(transform.y) + containerRect.height));
    }

    const handleDragStart = (e: InteractTypes.MXDragEvent) => {
        if (isValidDragPan(e.source, methods.resolveItem(e.source))){
            updateMaxDeltas();
            /**
             * Add our drag handlers
             */
            panning = true;
            interactions.on('drag', handleDrag);
            interactions.on('dragend', handleDragEnd);
            /**
             * Add our pan class
             */
            api.dom.rootEl.classList.add(FlowTypes.FlowClass.RootPanning);
        }
    }

    const handleDrag = (e: InteractTypes.MXDragEvent) => {
        updateMaxDeltas();
        deltaX = -clamp(-e.deltaX, transform.x, maxDeltaRight);
        deltaY = -clamp(-e.deltaY, transform.y, maxDeltaBottom);
        applyTransform(false);
    }
    
    const handleDragEnd = (e: InteractTypes.MXDragEvent) => {
        /**
         * Merge deltas with transform and zero out detlas, clear listeners
         */
        transform.x = transform.x + deltaX;
        transform.y = transform.y + deltaY;
        deltaX = 0;
        deltaY = 0;
        interactions.removeListener('drag', handleDrag);
        interactions.removeListener('dragend', handleDragEnd);
        panning = false;
        api.dom.rootEl.classList.remove(FlowTypes.FlowClass.RootPanning);
        applyTransform();
    }

    const stepPan = (stepX: number, stepY: number) => {
        deltaX = 0; // clear any existing delta values
        deltaY = 0;
        let containerRect = dom.containerEl.getBoundingClientRect();
        transform.x = -clamp(-(transform.x + stepX), 0, (width * transform.scale - containerRect.width));
        transform.y = -clamp(-(transform.y + stepY), 0, (height * transform.scale - containerRect.height));
        applyTransform();
    }

    const handleKeyDown = (e: InteractTypes.MXKeyboardEvent) => {
        if (api.opts.controls.panOnArrowKeys && methods.eventInGraph(e.source)){
            switch (e.source.key){
                case 'ArrowUp': stepPan(0, 75); break;
                case 'ArrowRight': stepPan(-75, 0); break;
                case 'ArrowDown': stepPan(0, -75); break;
                case 'ArrowLeft': stepPan(75, 0); break;
            }
        }
    }

    const handleWheel = (e: InteractTypes.MXWheelEvent) => {
        if (panning) return;
        let delta = Math.max(-1, Math.min(1, -e.source.deltaY));
        /**
         * Handle pan via wheel. This control supercededs zooming via pan.
         */
        if (api.opts.controls.panOnWheel){
            if (api.dom.containerEl === document.activeElement || api.dom.containerEl.contains(document.activeElement)){
                let step = (delta * 75);
                if (interactions.isModKeyActive('Shift')){
                    stepPan(step, 0);
                } else {
                    stepPan(0, step);
                }
                applyTransform();
            }
            return;
        }

        /**
         * Handle zoom via wheel.
         */
        if (api.opts.controls.zoomOnWheel){
            handleZoom(e.source);
        }
    }


    /**
     * ------------------------------------------------------------------------------------------------
     * Resize Handler
     * ------------------------------------------------------------------------------------------------
     */

    /**
     * Calculates "inherent" min scale based on window size and returns whichever is largest between the
     * inherent min and the min scale give in options.
     * 
     * @param containerRect 
     * @returns 
     */
    const getMinScale = (containerRect?: DOMRect) => {
        containerRect = containerRect ?? dom.containerEl.getBoundingClientRect();
        return Math.max(
            Math.max(containerRect.width / width, opts.minScale),
            Math.max(containerRect.height / height, opts.minScale),
        )   
        
    }

    const handleResize = () => {
        /**
         * Enforce min/max scale and positioning on resize. 
         * 
         * NOTE: This behavior doesn't seem quite right (sometimes resetting position overzealously), 
         * but it does effectively ensure that we don't end up w/ invalid scale or positioning which is enough for now.
         */
        let containerRect = dom.containerEl.getBoundingClientRect();
        let minScale = getMinScale(containerRect);
        let nextScale = Math.max(transform.scale, minScale);
        let maxX = (width * nextScale - containerRect.width);
        let maxY = (height * nextScale - containerRect.height);
        let nextX = -Math.min(maxX, Math.abs(transform.x));
        let nextY = -Math.min(maxY, Math.abs(transform.y));

        transform.scale = nextScale
        transform.x = nextX;
        transform.y = nextY;
        applyTransform();
    }

    const handleResizeThrottled = throttle(handleResize, 500);


    /**
     * ------------------------------------------------------------------------------------------------
     * Event binding
     * ------------------------------------------------------------------------------------------------
     */
    interactions.on('dragstart', handleDragStart);
    interactions.on('wheel', handleWheel);
    interactions.on('keydown', handleKeyDown);
    window.addEventListener('resize', handleResizeThrottled);
    const dispose = () => {
        interactions.removeListener('dragstart', handleDragStart);
        interactions.removeListener('drag', handleDrag);
        interactions.removeListener('dragend', handleDragEnd);
        interactions.removeListener('wheel', handleWheel);
        interactions.removeListener('keydown', handleKeyDown);
        window.removeEventListener('resize', handleResizeThrottled);
    }

    const handleZoom = (e: WheelEvent) => {
        //if (!methods.eventInGraph(e) || panning || api.isLocked()) return;

        //e.preventDefault();
        //e.stopPropagation();

        let containerRect = dom.containerEl.getBoundingClientRect();
        let delta = Math.max(-1, Math.min(1, -e.deltaY));
        let scalePageX = e.pageX - dom.containerEl.offsetLeft;
        let scalePageY = e.pageY - dom.containerEl.offsetTop;
        let translateX = -((scalePageX - transform.x) / transform.scale);
        let translateY = -((scalePageY - transform.y) / transform.scale);

        /**
         * Calculate our min and max scale. For min scale we must enforce "inherent" minimum to prevent 
         * our root element from ever being scaled so small that it does span the entire width of the
         * container.
         */
        let minScale = getMinScale(containerRect);
        let maxScale = opts?.maxScale!;

        /**
         * Calculate our next scale and return if it violates min/max constraints.
         * Uncomment scale to make the zooming feel more porpotional (at the cost
         * if easily divisible scale).
         */
        let nextScale = parseFloat( (transform.scale + (delta * opts?.scaleStep! /* * scale */)).toFixed(2) );
        if (nextScale < minScale || nextScale > maxScale) return;

        /**
         * Get our potential next x and y positions
         */ 
        let nextX = translateX * nextScale + scalePageX;
        let nextY = translateY * nextScale + scalePageY;

        /**
         * Use our next scale to calculate what the max x (left) and y (top) position will be.
         */ 
        let maxX = (width * nextScale - containerRect.width);
        let maxY = (height * nextScale - containerRect.height);

        /**
         * Enforce max x/y positions. 
         * 
         * NOTE: Tried to use clamp() method here but it seemed to introduce
         * tiny offsets when zooming against a boundary. Maybe something to do w/
         * Math.min/math.max. 
         * 
         */ 
        if (nextX > 0) nextX = 0;
        if (nextY > 0) nextY = 0;
        if (nextX < -maxX) nextX = -maxX;
        if (nextY < -maxY) nextY = -maxY;

        /**
         * Update our values and apply
         */ 
        transform.scale = nextScale;
        transform.x = nextX;
        transform.y = nextY;

        applyTransform(true);
        api.emit('transform', { ...transform });
        methods.recordAction('transform');
    }

    /**
     * Enforce resize 
     */
    handleResize();
    return <const> {
        name: 'panzoom',
        update,
        dispose
    }
}

export default MXFlowPanZoomTool;
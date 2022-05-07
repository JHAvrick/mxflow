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
    let startDiff: number = 0;
    let pointer1: PointerEvent | null = null;
    let pointer2: PointerEvent | null = null;
    let pinchStartDistance = 0;

    let canvasRect = dom.rootEl.getBoundingClientRect(); //Probably doesn't need to recalculated

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
        //console.log(transform.x, deltaX)
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

    // /**
    //  * Returns true if either delta hits the min or max boundary.
    //  * 
    //  * @param deltaX 
    //  * @param deltaY 
    //  * @returns 
    //  */
    // const shouldRebase = (deltaX: number, deltaY: number) => {
    //     // console.log(Math.abs(deltaX), Math.abs(transform.x), Math.abs(deltaX) <= Math.abs(transform.x))
    //     return Math.abs(deltaX) <= Math.abs(transform.x) || 
    //            Math.abs(deltaX) >= Math.abs(maxDeltaRight) ||
    //            Math.abs(deltaY) <= Math.abs(transform.y) || 
    //            Math.abs(deltaY) >= Math.abs(maxDeltaBottom);
    // }

    // /**
    //  * Resets drag by applying current deltas to our final transform values, recalculates
    //  * bounds, and instructs the InteractionEmitter to reset its deltas based on the most
    //  * recent drag event.
    //  * 
    //  * Rebasing allows the drag to behave more responsively around the graph boundaries.
    //  */
    // const rebase = (e: InteractTypes.MXDragEvent) => {
    //     transform.x = transform.x + deltaX;
    //     transform.y = transform.y + deltaY;
    //     updateMaxDeltas();
    //     interactions.rebaseDrag(e.source);
    // }

    const handleDrag = (e: InteractTypes.MXDragEvent) => {
        //console.log(e.deltaX)
        updateMaxDeltas();
        deltaX = -clamp(-e.deltaX, transform.x, maxDeltaRight);
        deltaY = -clamp(-e.deltaY, transform.y, maxDeltaBottom);
        console.log(maxDeltaRight, maxDeltaBottom);
        // if (shouldRebase(deltaX, deltaY)){
        //     //console.log("REBVASING")
        //     rebase(e);
        // }
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


    // const render = () => {
    //     if (panning){
    //         requestAnimationFrame(() => {
    //             if (pointer1){
    //                 let currentX = pointer1.pageX - dom.containerEl.offsetLeft;
    //                 let currentY = pointer1.pageY - dom.containerEl.offsetTop;
    //                 deltaX = -clamp(panStartX - currentX, transform.x, maxDeltaRight);
    //                 deltaY = -clamp(panStartY - currentY, transform.y, maxDeltaBottom);
    //                 applyTransform(false);
    //                 render();
    //             }
    //         })
    //         return;
    //     }

    //     // if (pinching){
    //     //     requestAnimationFrame(() => {
    //     //         if (pointer1 && pointer2){
    //     //             //console.log(pointer1.pointerId, pointer2.pointerId);
    //     //             let currentDistance = distance(pointer1.clientX, pointer1.clientY, pointer2.clientX, pointer2.clientY);
    //     //             let deltaDistance = currentDistance - pinchStartDistance;
    //     //             let step = Math.floor(Math.abs(deltaDistance) / 10);
    //     //             console.log( Math.abs(currentDistance / pinchStartDistance) - 1 );
    //     //             if (Math.abs(step) === 1){
    //     //                 let mid = midpoint(pointer1.clientX, pointer1.clientY, pointer2.clientX, pointer2.clientY);
    //     //                 zoom(mid[0], mid[1], Math.sign(deltaDistance) * step);
    //     //                 pinchStartDistance = currentDistance;
    //     //             }

                    

    //     //             //console.log(Math.floor((deltaDistance - pinchStartDistance) / 50)  );

                    

    //     //             // let currentX = pointer1.pageX - dom.containerEl.offsetLeft;
    //     //             // let currentY = pointer1.pageY - dom.containerEl.offsetTop;
    //     //             // deltaX = -clamp(panStartX - currentX, transform.x, maxDeltaRight);
    //     //             // deltaY = -clamp(panStartY - currentY, transform.y, maxDeltaBottom);
    //     //             applyTransform2(false);
    //     //             render();
    //     //         }
    //     //     })
    //     //     return;
    //     // }
    // }

    // const pinch = () => {
    //     if (pointer1 && pointer2){
    //         //console.log(pointer1.pointerId, pointer2.pointerId);
    //         let currentDistance = distance(pointer1.clientX, pointer1.clientY, pointer2.clientX, pointer2.clientY);
    //         let deltaDistance = currentDistance - pinchStartDistance;
    //         let step = Math.floor(Math.abs(deltaDistance) / 5);


    //         let diff = Math.max(pointer2.clientX - pointer1.clientX, pointer2.clientY - pointer1.clientY);

            
    //         //console.log(startDiff - diff);
            
    //         //let diff = deltaDistance; //pointer2.clientX - pointer1.clientX;

    //         //if (diff !== 0 && startDiff !== 0){

    //             //console.log

    //             let change1 = (deltaDistance / pinchStartDistance);
    //             let change2 = (diff / startDiff) - 1;

    //             //let nextScale = clamp(transform.scale + (((diff / startDiff) - 1) * 1.5), transform.scale - .01, transform.scale + .01);
    //             let nextScale = transform.scale + change1;
    //             //console.log()

    //             //let nextScale = transform.scale + scaleDelta;
    //             //console.log(transform.scale + (((diff / startDiff) - 1) * 1.5), nextScale);
    //             let mid = midpoint(pointer1.clientX, pointer1.clientY, pointer2.clientX, pointer2.clientY);
    
    //             //console.log((diff / startDiff) - 1);
    
    //             zoomToScale(mid[0], mid[1], nextScale);
    
    //             startDiff = diff;
    //             pinchStartDistance = currentDistance;
    //         //}



    //         //console.log(diff);
    //         // if (Math.abs(step) >= 1){
    //         //     let mid = midpoint(pointer1.clientX, pointer1.clientY, pointer2.clientX, pointer2.clientY);
    //         //     zoom(mid[0], mid[1], Math.sign(deltaDistance) * step);
    //         //     pinchStartDistance = currentDistance;
    //         // }

            

    //         //console.log(Math.floor((deltaDistance - pinchStartDistance) / 50)  );

            

    //         // let currentX = pointer1.pageX - dom.containerEl.offsetLeft;
    //         // let currentY = pointer1.pageY - dom.containerEl.offsetTop;
    //         // deltaX = -clamp(panStartX - currentX, transform.x, maxDeltaRight);
    //         // deltaY = -clamp(panStartY - currentY, transform.y, maxDeltaBottom);
    //         applyTransform2(false);
    //         render();
    //     }
    // }

    // const zoomToScale = (x: number, y: number, scale: number) => {
    //     if (panning || api.isLocked('panzoom')) return;

    //     let containerRect = dom.containerEl.getBoundingClientRect();
    //     //let delta = Math.max(-1, Math.min(1, -e.deltaY));
    //     let scalePageX = x - dom.containerEl.offsetLeft;
    //     let scalePageY = y - dom.containerEl.offsetTop;
    //     let translateX = -((scalePageX - transform.x) / transform.scale);
    //     let translateY = -((scalePageY - transform.y) / transform.scale);

    //     /**
    //      * Calculate our min and max scale. For min scale we must enforce "inherent" minimum to prevent 
    //      * our root element from ever being scaled so small that it does span the entire width of the
    //      * container.
    //      */
    //     let minScale = getMinScale(containerRect);
    //     let maxScale = opts?.maxScale!;

    //     /**
    //      * Calculate our next scale and return if it violates min/max constraints.
    //      * Uncomment scale to make the zooming feel more porpotional (at the cost
    //      * if easily divisible scale).
    //      */
    //     let nextScale = parseFloat(scale.toFixed(8)); //parseFloat( (transform.scale + (delta * .01  /* * transform.scale */)).toFixed(2) );
    //     if (nextScale < minScale || nextScale > maxScale) return;

    //     /**
    //      * Get our potential next x and y positions
    //      */ 
    //     let nextX = translateX * nextScale + scalePageX;
    //     let nextY = translateY * nextScale + scalePageY;

    //     /**
    //      * Use our next scale to calculate what the max x (left) and y (top) position will be.
    //      */ 
    //     let maxX = (width * nextScale - containerRect.width);
    //     let maxY = (height * nextScale - containerRect.height);

    //     /**
    //      * Enforce max x/y positions. 
    //      * 
    //      * NOTE: Tried to use clamp() method here but it seemed to introduce
    //      * tiny offsets when zooming against a boundary. Maybe something to do w/
    //      * Math.min/math.max. 
    //      * 
    //      */ 
    //     if (nextX > 0) nextX = 0;
    //     if (nextY > 0) nextY = 0;
    //     if (nextX < -maxX) nextX = -maxX;
    //     if (nextY < -maxY) nextY = -maxY;

    //     /**
    //      * Update our values and apply
    //      */ 
    //     transform.scale = nextScale;
    //     transform.x = nextX;
    //     transform.y = nextY;

    //     applyTransform(true);
    //     api.emit('transform', { ...transform });
    //     methods.recordAction('transform');
    // }


    // const zoom = (x: number, y: number, delta: number) => {
    //     if (panning || api.isLocked('panzoom')) return;

    //     let containerRect = dom.containerEl.getBoundingClientRect();
    //     //let delta = Math.max(-1, Math.min(1, -e.deltaY));
    //     let scalePageX = x - dom.containerEl.offsetLeft;
    //     let scalePageY = y - dom.containerEl.offsetTop;
    //     let translateX = -((scalePageX - transform.x) / transform.scale);
    //     let translateY = -((scalePageY - transform.y) / transform.scale);

    //     /**
    //      * Calculate our min and max scale. For min scale we must enforce "inherent" minimum to prevent 
    //      * our root element from ever being scaled so small that it does span the entire width of the
    //      * container.
    //      */
    //     let minScale = getMinScale(containerRect);
    //     let maxScale = api.opts.panzoom.maxScale;

    //     /**
    //      * Calculate our next scale and return if it violates min/max constraints.
    //      * Uncomment scale to make the zooming feel more porpotional (at the cost
    //      * if easily divisible scale).
    //      */
    //     let nextScale = parseFloat( (transform.scale + (delta * .01  /* * transform.scale */)).toFixed(2) );
    //     if (nextScale < minScale || nextScale > maxScale) return;

    //     /**
    //      * Get our potential next x and y positions
    //      */ 
    //     let nextX = translateX * nextScale + scalePageX;
    //     let nextY = translateY * nextScale + scalePageY;

    //     /**
    //      * Use our next scale to calculate what the max x (left) and y (top) position will be.
    //      */ 
    //     let maxX = (width * nextScale - containerRect.width);
    //     let maxY = (height * nextScale - containerRect.height);

    //     /**
    //      * Enforce max x/y positions. 
    //      * 
    //      * NOTE: Tried to use clamp() method here but it seemed to introduce
    //      * tiny offsets when zooming against a boundary. Maybe something to do w/
    //      * Math.min/math.max. 
    //      * 
    //      */ 
    //     if (nextX > 0) nextX = 0;
    //     if (nextY > 0) nextY = 0;
    //     if (nextX < -maxX) nextX = -maxX;
    //     if (nextY < -maxY) nextY = -maxY;

    //     /**
    //      * Update our values and apply
    //      */ 
    //     transform.scale = nextScale;
    //     transform.x = nextX;
    //     transform.y = nextY;

    //     applyTransform(true);
    //     api.emit('transform', { ...transform });
    //     methods.recordAction('transform');
    // }

    // /**
    //  * TODO: If added nested graphs in the future, we need the nested graph to be aware of it's node's bounding box 
    //  * or x/y position to get proper offset
    //  */
    // // const getOffset = () => {
    // //     let containerRect = dom.containerEl.getBoundingClientRect();
    // //     if (api.opts.parent){
    // //         return {
    // //             x: api.opts.parent.getDom().containerEl.offsetLeft + dom.containerEl.offsetLeft + containerRect.left + 18,
    // //             y: api.opts.parent.getDom().containerEl.offsetTop + dom.containerEl.offsetTop + containerRect.left + 18,
    // //         }
    // //     }
    // //     return {
    // //         x: dom.containerEl.offsetLeft,
    // //         y: dom.containerEl.offsetTop
    // //     }
    // // }
 
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

    // const isValidPan = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
    //     return e.isPrimary && !api.isLocked('panzoom') && item?.type === 'graph' &&  /*&& opts.panFilter!(e) */ (e.pointerType !== 'mouse' || e.button === opts.controls.panButton);
    // }

    // const onDown = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
    //     //Is primary?
    //         //Start pan
    //     //Is secondary?
    //         //Is "pinching" already active? Ignore. Could also just check whether we have two pointers
    //         //Otherwise, assign second pointer and call endPan(e)
        
    //     //Is primary?
    //         //If no, stop panning and start zooming bitch

    //     if (isValidPan(e, item)){
    //         e.preventDefault();
    //         panning = true;
    //         pointer1 = e;

    //         /**
    //          * Record our start position so that can discern movement
    //          */ 
    //         panStartX = e.pageX - dom.containerEl.offsetLeft;
    //         panStartY = e.pageY - dom.containerEl.offsetTop;

    //         /**
    //          * Get current container and canvas rects to perform bounds calculations
    //          */ 
    //         let containerRect = dom.containerEl.getBoundingClientRect();
    //         let canvasRect = dom.rootEl.getBoundingClientRect();

    //         /**
    //          * Calculate the max delta for right and bottom bounds. Max delta for left and right
    //          * bounds is just the current x/y positions.
    //          */ 
    //         maxDeltaRight = (canvasRect.width - (Math.abs(transform.x) + containerRect.width));
    //         maxDeltaBottom = (canvasRect.height - (Math.abs(transform.y) + containerRect.height));

    //         /**
    //          * Add our move listener (removed on up event)
    //          */ 
    //         document.addEventListener("pointermove", handleMove); //listen for move
    //         api.lock('panzoom');

    //         //start render cycle
    //         render();
    //     }
    // }
    
    // const handleMove = (e: PointerEvent) => {
    //     //console.log(e.pointerId, pointer1?.pointerId, e.pointerId === pointer1?.pointerId);
    //     /**
    //      * Always keep track of our pointers. If we are panning and not pinching, pointer2 will
    //      * just be repeatedly assigned null.
    //      */
    //     if (panning || pinching){
    //         pointer1 = e.pointerId === pointer1?.pointerId ? e : pointer1;
    //         pointer2 = e.pointerId === pointer2?.pointerId ? e : pointer2;
    //     }

    //     if (pinching){
    //         pinch()
    //     }

    //     /**
    //      * Pointer is primary, there is no secondary and we aren't panning yet. Start Panning.
    //      */
    //     if (!panning && !pinching && e.isPrimary){
    //         panning = true;
    //         pinching = false;
    //         return;
    //     }
        
    //     /**
    //      * Pointer is secondary and we aren't pinching yet. Start pinching.
    //      */
    //     ///console.log(e.pointerId, pointer1?.pointerId);
    //     if (!pinching && pointer1 && pointer1?.pointerId !== e.pointerId){
    //         pointer2 = e;
    //         panning = false;
    //         pinching = true;
    //         startDiff = Math.max(pointer2.clientX - pointer1.clientX, pointer2.clientY - pointer1.clientY);
    //         pinchStartDistance = distance(pointer1.clientX, pointer1.clientY, pointer2.clientX, pointer2.clientY);
    //         return;
    //     }
    // }

    // const handleUp = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
    //     /**
    //      * Secondary pointer was lifted. End pinch. Panning will be resumed
    //      * in the `move` event if the primary pointer is still down.
    //      */
    //     if (!e.isPrimary && e.pointerId === pointer2?.pointerId){
    //         pointer2 = null;
    //         pinching = false;
    //         return;
    //     }

    //     /**
    //      * Kill any active operation if primary pointer leaves
    //      */
    //     if (e.isPrimary && (panning || pinching)){
    //         endPanPinch();
    //     }
    // }

    // const endPanPinch = () => {
    //     transform.x = transform.x + deltaX;
    //     transform.y = transform.y + deltaY;
    //     deltaX = 0;
    //     deltaY = 0;
    //     panning = false;
    //     pinching = false;
    //     pointer1 = null;
    //     pointer2 = null
    //     document.removeEventListener("pointermove", handleMove);
    //     state.transform = transform;
    //     api.emit('transform', {...transform});
    //     methods.recordAction('transform');
    //     api.unlock();
    // }

    // const onCancel = () => {
    //     if (pinching || panning){
    //         endPanPinch()
    //     }
    // }
 
    // dom.containerEl.addEventListener("wheel", handleWheel);
    // //dom.rootEl.addEventListener('pointerdown', handleDown);
    // document.addEventListener("pointerup", handleUp);
    // window.addEventListener('resize', handleResizeThrottled);
    // const dispose = () => {
    //     dom.containerEl.removeEventListener("wheel", handleWheel);
    //     //.rootEl.removeEventListener('pointerdown', handleDown);
    //     document.removeEventListener("pointerup", handleUp);
    //     document.removeEventListener("pointermove", handleMove);
    //     window.addEventListener('resize', handleResizeThrottled);
    // }

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
import * as FlowTypes from 'types/flow.types.v2';
import { getPublicInterface } from '../methods';
import clamp from 'lodash/clamp'

/**
 * MXFlow tool which handles lasso selection
 */
function MXFlowPanZoomTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>) : FlowTypes.ActionHandler {
    let opts = api.opts.panzoom;
    let state = api.state;
    let dom = api.dom;
    let transform = state.transform;
    let active = false;
    let width = dom.rootEl.getBoundingClientRect().width;
    let height = dom.rootEl.getBoundingClientRect().height;
    let deltaX = 0;
    let deltaY = 0;
    let panStartX = 0;
    let panStartY = 0;
    let maxDeltaBottom = 0;
    let maxDeltaRight = 0;
    let lastMoveEvent: PointerEvent | null = null;

    const onUpdate = (api: FlowTypes.Api) => {
        opts = api.opts.panzoom;
        state = api.state;
        dom = api.dom;
        transform = state.transform;
    }

    const applyTransform = (transition: boolean = false) => {
        dom.rootEl.style.transition = transition ? 'transform .3s' : '';
        dom.rootEl.style.transform = `translate(${transform.x + deltaX}px, ${transform.y + deltaY}px) scale(${transform.scale})`;
    }

    const render = () => {
        if (active){
            requestAnimationFrame(() => {
                if (lastMoveEvent){
                    let currentX = lastMoveEvent.pageX - dom.containerEl.offsetLeft;
                    let currentY = lastMoveEvent.pageY - dom.containerEl.offsetTop;
                    deltaX = -clamp(panStartX - currentX, transform.x, maxDeltaRight);
                    deltaY = -clamp(panStartY - currentY, transform.y, maxDeltaBottom);
                    applyTransform(false);
                    render();
                }
            })
        }
    }

    const handleWheel = (e: WheelEvent) => {
        if (active || api.isLocked()) return;

        e.preventDefault();
        //e.stopPropagation();

        let delta = Math.max(-1, Math.min(1, -e.deltaY));
        let scalePageX = e.pageX - dom.containerEl.offsetLeft;
        let scalePageY = e.pageY - dom.containerEl.offsetTop;
        let translateX = -((scalePageX - transform.x) / transform.scale);
        let translateY = -((scalePageY - transform.y) / transform.scale);

        /**
         * Calculate our next scale and return if it violates min/max constraints.
         * Uncomment scale to make the zooming feel more porpotional (at the cost
         * if easily divisible scale)
         */
        let nextScale = parseFloat( (transform.scale + (delta * opts?.scaleStep! /* * scale */)).toFixed(2) );
        if (nextScale < opts?.minScale! || nextScale > opts?.maxScale!) return;

        /**
         * Get our potential next x and y positions
         */ 
        let nextX = translateX * nextScale + scalePageX;
        let nextY = translateY * nextScale + scalePageY;

        /**
         * Use our next scale to calculate what the max x (left) and y (top) position will be.
         */ 
        let containerRect = dom.containerEl.getBoundingClientRect();
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

    const onDown = (e: PointerEvent) => {
        if (e.button === opts?.controls?.panButton /* && opts.panFilter!(e) */){
            e.preventDefault();
            active = true;
            lastMoveEvent = e;

            /**
             * Record our start position so that can discern movement
             */ 
            panStartX = e.pageX - dom.containerEl.offsetLeft;
            panStartY = e.pageY - dom.containerEl.offsetTop;

            /**
             * Get current container and canvas rects to perform bounds calculations
             */ 
            let containerRect = dom.containerEl.getBoundingClientRect();
            let canvasRect = dom.rootEl.getBoundingClientRect();

            /**
             * Calculate the max delta for right and bottom bounds. Max delta for left and right
             * bounds is just the current x/y positions.
             */ 
            maxDeltaRight = (canvasRect.width - (Math.abs(transform.x) + containerRect.width));
            maxDeltaBottom = (canvasRect.height - (Math.abs(transform.y) + containerRect.height));

            /**
             * Add our move listener (removed on up event)
             */ 
            document.addEventListener("pointermove", handleMove); //listen for move
            api.lock('panzoom');

            //start render cycle
            render();
        }
    }
    
    const handleMove = (e: PointerEvent) => {
        lastMoveEvent = e;
    }

    const handleUp = (e: PointerEvent) => {
        if (e.button === opts?.controls!.panButton){
            endPan(e);
        }
    }

    const endPan = (e: PointerEvent) => {
        transform.x = transform.x + deltaX;
        transform.y = transform.y + deltaY;
        deltaX = 0;
        deltaY = 0;
        active = false;
        lastMoveEvent = null;
        document.removeEventListener("pointermove", handleMove);
        state.transform = transform;
        api.emit('transform', {...transform});
        methods.recordAction('transform');
        api.unlock();
    }

    const onCancel = () => {
        if (active && lastMoveEvent){
            endPan(lastMoveEvent)
        }
    }
 
    dom.containerEl.addEventListener("wheel", handleWheel);
    //dom.rootEl.addEventListener('pointerdown', handleDown);
    document.addEventListener("pointerup", handleUp);
    const dispose = () => {
        dom.containerEl.removeEventListener("wheel", handleWheel);
        //.rootEl.removeEventListener('pointerdown', handleDown);
        document.removeEventListener("pointerup", handleUp);
        document.removeEventListener("pointermove", handleMove);
    }

    return <const> {
        name: 'panzoom',
        onCancel,
        onUpdate,
        onDown,
        dispose
    }
}

export default MXFlowPanZoomTool;
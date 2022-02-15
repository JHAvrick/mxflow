import { EventEmitter, Listener } from "./util/event-emitter";
import * as FlowTypes from './types/flow.types.v2';
import * as InteractTypes from './types/interact.types';

const getModifierMap = (api: FlowTypes.Api) => {
    const controls = api.opts.controls;
    const modifiers = new Map<string, boolean>();
    if (typeof controls.multiSelectModifier === 'string') modifiers.set(controls.multiSelectModifier.toLowerCase(), false);
    if (typeof controls.panModifier === 'string') modifiers.set(controls.panModifier.toLowerCase(), false);
    if (typeof controls.zoomOnWheelModifier === 'string') modifiers.set(controls.zoomOnWheelModifier.toLowerCase(), false);
    if (typeof controls.lassoModifier === 'string') modifiers.set(controls.lassoModifier.toLowerCase(), false);
    return modifiers;
}

const InteractionEmitter = (api: FlowTypes.Api, methods: FlowTypes.Methods) => {
    const events = new EventEmitter();
    const emit = <K extends keyof InteractTypes.InteractEventMap>(type: K, event?: InteractTypes.InteractEventMap[K]) => {
        events.emit(type, event);
    }

    /**
     * Map to keep track of modifiers and their states
     */
    const modifiers = getModifierMap(api);

    /**
     * Double tap state
     */
    const doubleTap : InteractTypes.DoubleTap = {
        thresholdMs: 25,
        lastTarget: null,
        timeout: null
    }

    /**
     * Dragging state
     */
    const drag : InteractTypes.Drag = {
        thresholdPx: 3, 
        startEvent: null,
        latched: false
    }

    const getDragLatched = (e: PointerEvent) => {
        let deltaX = e.clientX - drag.startEvent!.clientX;
        let deltaY = e.clientY - drag.startEvent!.clientY;
        return (Math.abs(deltaX) > drag.thresholdPx || Math.abs(deltaY) > drag.thresholdPx);
    }

    /**
     * Get a drag event
     * 
     * @param e - The event from which to calcualte deltas
     * @param source - Pass in an alternate source event. This is used to pass in original PointerEvent
     * for `dragstart` event, but calculate deltas from last move event.
     * @returns 
     */
    const getDragEvent = (e: PointerEvent, source?: PointerEvent) => {
        let deltaX = e.clientX - drag.startEvent!.clientX;
        let deltaY = e.clientY - drag.startEvent!.clientY;
        return { 
            start: drag.startEvent!,
            source: source ?? e,
            deltaX: deltaX,
            deltaY: deltaY,
            scaledDeltaX: deltaX / api.state.transform.scale,
            scaledDeltaY: deltaY / api.state.transform.scale
        }
    }

    const handlePointerDown = (e: PointerEvent) => {
        /**
         * Handle double tap
         */
        if (!doubleTap.lastTarget){ //Set initial timeout
            doubleTap.lastTarget = <Element> e.target;
            doubleTap.timeout = window.setTimeout(() => doubleTap.lastTarget = null, doubleTap.thresholdMs);
        } else if (e.target === doubleTap.lastTarget) {
            emit('doubletap', { source: e }) //Tap on same target before timeout cleared, emit event
        } else {
            window.clearTimeout(doubleTap.timeout!); //Wrong target or timeout nullified original target
        }
        
        /**
         * Handle drag start, but not latch
         */
        if (e.isPrimary){
            drag.startEvent = e;
        }
        
        emit('down', { source: e })
    }

    const handlePointerMove = (e: PointerEvent) => {
        /**
         * Handle drag
         */
        if (e.isPrimary && drag.startEvent){
            if (!drag.latched){
                /**
                 * Emit dragstart if we have dragged past the "latch" threshold
                 */
                if (getDragLatched(e)){
                    emit('dragstart', getDragEvent(drag.startEvent, drag.startEvent));
                    drag.startEvent = e;
                    drag.latched = true;
                }
            } else {
                /**
                 * If we've already latched, emit drag event
                 */
                emit('drag', getDragEvent(e))
            }
        }

        emit('move', { source: e })
    }

    const handlePointerUp = (e: PointerEvent) => {
        /**
         * End our drag event if applicable
         */
        if (drag.startEvent && e.isPrimary){
            if (drag.latched){
                emit('dragend', getDragEvent(e))
            }
            drag.latched = false;
            drag.startEvent = null;
        }

        emit('up', { source: e })
    }

    const handleDoubleClick = (e: MouseEvent) => {
        emit('doubletap', { source: e });
    }

    const updateModifiers = (e: KeyboardEvent) => {
        let code = e.key.toLowerCase();
        let val = modifiers.get(code);
        if (val !== null && val !== undefined){
            modifiers.set(code, e.type === 'keydown');
        }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        updateModifiers(e);
        emit('keydown', { source: e });
    }

    const handleKeyUp = (e: KeyboardEvent) => {
        updateModifiers(e);
        emit('keyup', { source: e });
    }

    const handleContextMenu = (e: MouseEvent) => {
        if (methods.eventInGraph(e)){
            e.preventDefault();
            emit('contextmenu', { 
                source: e,
                item: methods.resolveItem(e)
            });
        }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('dblclick', handleDoubleClick);
    document.addEventListener('contextmenu', handleContextMenu);

    return <const> {
        on<K extends keyof InteractTypes.InteractEventMap>(type: K, listener: (event: InteractTypes.InteractEventMap[K]) => any){
            events.on(type, listener);
        },
        removeListener<K extends keyof InteractTypes.InteractEventMap>(type: K, listener: Listener){
            events.removeListener(type, listener);
        },
        dispose(){
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('pointerdown', handlePointerUp);
            document.removeEventListener('pointerdown', handlePointerMove);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('dblclick', handleDoubleClick);
            document.removeEventListener('contextmenu', handleContextMenu);
        },
        /**
         * Returns true if the modifier key denoted by the given modifier control option
         * is active. ()
         * 
         * @param modConfigOpt - The config option (`panModifier`, `multiSelectModifier` etc.);
         */
        isModActive(modConfigOpt: keyof FlowTypes.ControlOptions){
            let key = api.opts.controls[modConfigOpt];
            if (typeof key === 'string'){
                return modifiers.get(key.toLowerCase());
            }
        },
        rebaseDrag(e: PointerEvent){
            drag.startEvent = e;
        },
        dragging(){
            return drag.latched;
        }
    }
}

export default InteractionEmitter;
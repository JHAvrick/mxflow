import InteractionEmitter from '../interact';
interface Drag {
    thresholdPx: number;
    startEvent: PointerEvent | null;
    latched: boolean;
}
interface DoubleTap {
    thresholdMs: number;
    lastTarget: Element | null;
    timeout: number | null;
}
interface MXPointerEvent {
    source: PointerEvent;
}
interface MXDragEvent {
    source: PointerEvent;
    deltaX: number;
    deltaY: number;
    scaledDeltaX: number;
    scaledDeltaY: number;
}
interface MXKeyboardEvent {
    source: KeyboardEvent;
}
interface MXWheelEvent {
    source: MouseEvent;
}
interface MXPinchEvent {
    source: [PointerEvent, PointerEvent];
}
interface MXDoubleTapEvent {
    source: PointerEvent | MouseEvent;
}
interface InteractEventMap {
    'down': MXPointerEvent;
    'up': MXPointerEvent;
    'move': MXPointerEvent;
    'dragstart': MXDragEvent;
    'drag': MXDragEvent;
    'dragend': MXDragEvent;
    'wheel': MXWheelEvent;
    'pinch': MXPinchEvent;
    'doubletap': MXDoubleTapEvent;
    'keydown': MXKeyboardEvent;
    'keyup': MXKeyboardEvent;
}
declare type InteractionEmitter = ReturnType<typeof InteractionEmitter>;
export { Drag, DoubleTap, MXPointerEvent, MXDragEvent, MXKeyboardEvent, MXWheelEvent, MXPinchEvent, MXDoubleTapEvent, InteractEventMap, InteractionEmitter };

import { Listener } from "./util/event-emitter";
import * as FlowTypes from './types/flow.types.v2';
import * as InteractTypes from './types/interact.types';
declare const InteractionEmitter: (api: FlowTypes.Api, methods: FlowTypes.Methods) => {
    readonly on: <K extends keyof InteractTypes.InteractEventMap>(type: K, listener: (event: InteractTypes.InteractEventMap[K]) => any) => void;
    readonly removeListener: <K_1 extends keyof InteractTypes.InteractEventMap>(type: K_1, listener: Listener) => void;
    readonly dispose: () => void;
    /**
     * Returns true if the modifier key denoted by the given modifier control option
     * is active. ()
     *
     * @param modConfigOpt - The config option (`panModifier`, `multiSelectModifier` etc.);
     */
    readonly isModActive: (modConfigOpt: keyof FlowTypes.ControlOptions) => boolean | undefined;
    readonly isModKeyActive: (key: string) => boolean | undefined;
    readonly rebaseDrag: (e: PointerEvent) => void;
    readonly dragging: () => boolean;
};
export default InteractionEmitter;

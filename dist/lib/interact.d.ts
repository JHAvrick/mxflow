import { Listener } from "./util/event-emitter";
import * as FlowTypes from './types/flow.types.v2';
import * as InteractTypes from './types/interact.types';
declare const InteractionEmitter: (api: FlowTypes.Api) => {
    readonly on: <K extends keyof InteractTypes.InteractEventMap>(type: K, listener: (event: InteractTypes.InteractEventMap[K]) => any) => void;
    readonly removeListener: <K_1 extends keyof InteractTypes.InteractEventMap>(type: K_1, listener: Listener) => void;
    readonly dispose: () => void;
};
export default InteractionEmitter;

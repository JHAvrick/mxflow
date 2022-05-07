import * as FlowTypes from 'types/flow.types.v2';
import * as InteractTypes from 'types/interact.types';
/**
 * MXFlow tool which handles basic selections w/ down and down + shift;
 */
declare function MXFlowSelectTool(api: FlowTypes.Api, methods: FlowTypes.Methods, interactions: InteractTypes.InteractionEmitter): FlowTypes.ActionHandler;
export default MXFlowSelectTool;

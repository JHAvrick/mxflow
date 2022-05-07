import * as InteractTypes from 'types/interact.types';
import * as FlowTypes from 'types/flow.types.v2';
import { getPublicInterface } from '../methods';
/**
 * MXFlow tool which handles lasso selection
 */
declare function MXFlowLinkerTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>, interactions: InteractTypes.InteractionEmitter): FlowTypes.ActionHandler;
export default MXFlowLinkerTool;

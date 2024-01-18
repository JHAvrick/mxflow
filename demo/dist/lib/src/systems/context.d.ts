import * as InteractTypes from 'types/interact.types';
import * as FlowTypes from 'types/flow.types.v2';
import { getPublicInterface } from '../methods';
/**
 * Drag node tool
 */
declare function MXFlowContextTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>, interactions: InteractTypes.InteractionEmitter): FlowTypes.ActionHandler;
export default MXFlowContextTool;

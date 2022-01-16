import * as FlowTypes from 'types/flow.types.v2';
import { getPublicInterface } from '../methods';
/**
 * MXFlow tool which handles lasso selection
 */
declare function MXFlowPanZoomTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>): FlowTypes.ActionHandler;
export default MXFlowPanZoomTool;

import * as FlowTypes from 'types/flow.types.v2';
import { FlowMethods } from '../methods';
/**
 * MXFlow tool which handles basic selections w/ down and down + shift;
 */
declare function MXFlowSelectTool(api: FlowTypes.Api, methods: FlowMethods): FlowTypes.ActionHandler;
export default MXFlowSelectTool;

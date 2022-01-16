import * as FlowTypes from 'types/flow.types.v2';
import { getPublicInterface } from '../methods';
/**
 * Handlers for various shortcuts
 */
declare function MXFlowShortcutTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>): FlowTypes.ActionHandler;
export default MXFlowShortcutTool;

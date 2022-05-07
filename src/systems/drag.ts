import * as InteractTypes from 'types/interact.types';
import * as FlowTypes from 'types/flow.types.v2';
import * as FlowUtil from '../flow-util';

/**
 * Drag node tool
 */
function MXFlowDragTool(api: FlowTypes.Api, methods: FlowTypes.Methods, interactions: InteractTypes.InteractionEmitter) : FlowTypes.ActionHandler {
    let state = api.state;
    let items: FlowTypes.Node[] = [];
    let gridX = api.opts.drag.gridX || 0;
    let gridY = api.opts.drag.gridY || 0;
    let deltaChanged = false;
    //let latchThreshold = api.opts.drag.latchThreshold || 5;

    const update = (api: FlowTypes.Api) => {
        state = api.state;
        gridX = api.opts.drag.gridX || 0;
        gridY = api.opts.drag.gridY || 0;
        //latchThreshold = api.opts.drag.latchThreshold || 5;
        // latchThresholdX = gridX ? gridX : latchThreshold;
        // latchThresholdY = gridY ? gridY : latchThreshold;
    }

    const isValid = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
        //console.log(!state.multi, state.selected.size !== 0, item?.type === 'node', e.pointerType, e.button, api.opts.select.button)
        return !interactions.isModActive('multiSelectModifier') && 
                state.selected.size !== 0 && 
                item && item.type === 'node' && 
                (e.pointerType !== 'mouse' || e.button === api.opts.controls.selectButton);
    }

    const applyDrag = (e: InteractTypes.MXDragEvent, finalize: boolean = false) => {
        let deltaX: number = gridX !== 0 ? (gridX * Math.floor(e.scaledDeltaX / gridX)) : e.scaledDeltaX;
        let deltaY: number = gridY !== 0 ? (gridY * Math.floor(e.scaledDeltaY / gridY)) : e.scaledDeltaY;

        //Track when delta changes. We don't want to record any action when grid dragging unless an item actually moved
        if (!deltaChanged && (deltaX !== 0 || deltaY !== 0)){
            deltaChanged = true;
        }

        items.forEach(item => {
            /**
             * Calculate an item's offset from the grid and factor it into the deltas. 
             * This prevents each item from being on a "different grid" if the grid was
             * activated after some items were already dragged freely without it.
             * 
             * TODO: Make this optionally the bounding box offset?
             */ 
            let gridOffsetX = gridX !== 0 ? item.x % gridX : 0;
            let gridOffsetY = gridY !== 0 ? item.y % gridY : 0;
            /**
             * Set deltas and apply new position
             */
            if (finalize){
                let finalX = item.x + (deltaX - gridOffsetX);
                let finalY = item.y + (deltaY - gridOffsetY);
                item.x = finalX;
                item.y = finalY;
                item.deltaX = 0;
                item.deltaY = 0;
            } else {
                item.deltaX = deltaX - gridOffsetX;
                item.deltaY = deltaY - gridOffsetY;
            }

            FlowUtil.applyNodePosition(item);
        })
        
        FlowUtil.applyAllLinkPositions(api);
    }

    const handleDragStart = (e: InteractTypes.MXDragEvent) => {
        let item = methods.resolveItem(e.source);
        if (isValid(e.source, item)){
            items = <FlowTypes.Node[]> Array.from(state.selected.values())
                .filter(item => item.type === FlowTypes.FlowItemType.Node);

            interactions.on('drag', handleDrag);
            interactions.on('dragend', handleDragEnd);

            deltaChanged = false;
            applyDrag(e);
        }
    }

    const handleDrag = (e: InteractTypes.MXDragEvent) => {
        applyDrag(e);
    }

    const handleDragEnd = (e: InteractTypes.MXDragEvent) => {
        applyDrag(e, true);
        items = [];
        interactions.removeListener('drag', handleDrag);
        interactions.removeListener('dragend', handleDragEnd);

        /**
         * If our deltas actually changed during this drag (may not have if grid is enabled),
         * record our drag action
         */
        if (deltaChanged){
            methods.recordAction(FlowTypes.ActionTypes.DRAG);
        }
    }

    interactions.on('dragstart', handleDragStart);
    const dispose = () => {
        interactions.removeListener('dragstart', handleDragStart);
        interactions.removeListener('drag', handleDrag);
        interactions.removeListener('dragend', handleDragEnd);
    }

    return <const> {
        name: 'drag',
        update,
        dispose
    }
}

export default MXFlowDragTool;
import * as FlowTypes from 'types/flow.types.v2';
import * as FlowUtil from '../flow-util';
import { getPublicInterface } from '../methods';

/**
 * Drag node tool
 */
function MXFlowDragTool(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>) : FlowTypes.ActionHandler {
    let state = api.state;
    let active = false;
    let latched = false;
    let items: FlowTypes.Node[] = [];
    let startX = 0;
    let startY = 0;
    let gridX = api.opts.drag?.gridX || 0;
    let gridY = api.opts.drag?.gridY || 0;
    let latchThreshold = api.opts.drag?.latchThreshold || 5;
    let latchThresholdX = gridX ? gridX : latchThreshold;
    let latchThresholdY = gridY ? gridY : latchThreshold;

    const onUpdate = (api: FlowTypes.Api) => {
        state = api.state;
        gridX = api.opts.drag?.gridX || 0;
        gridY = api.opts.drag?.gridY || 0;
        latchThreshold = api.opts.drag?.latchThreshold || 5;
        latchThresholdX = gridX ? gridX : latchThreshold;
        latchThresholdY = gridY ? gridY : latchThreshold;
    }

    const startDrag = (e: PointerEvent) => {
        if (state.selected.size === 0 || active) return;

        //Get draggable items
        items = <FlowTypes.Node[]> Array.from(state.selected.values()).filter(item => item.type === FlowTypes.FlowItemType.Node);

        //TODO: Bounds checking, grid calculations if applicable

        active = true;
        startX = e.pageX;
        startY = e.pageY;

        api.lock('drag');
    }

    const onDown = (e: PointerEvent, item?: FlowTypes.FlowItem) => {
        if (!item || item.type !== 'node') return;
        if (state.multi) return;
        if (e.button === api.opts.select?.button){
            let nodrag = false; //TODO - Check whether target has no-drag
            startDrag(e);
        }
    }

    const onMove = (e: PointerEvent) => {
        if (!e.isPrimary || !active) return;

        //Get raw delta values. These will be the final values unless grid is enabled.
        let deltaXRaw = (e.pageX - startX) / state.transform.scale;
        let deltaYRaw = (e.pageY - startY) / state.transform.scale;

        //Calculate grid if necessary
        let deltaX: number = gridX !== 0 ? (gridX * Math.floor(deltaXRaw / gridX)) : deltaXRaw;
        let deltaY: number = gridY !== 0 ? (gridY * Math.floor(deltaYRaw / gridY)) : deltaYRaw;

        //Check whether the drag has latched
        if (!latched && (deltaXRaw > latchThresholdX || deltaYRaw > latchThresholdY)){
            latched =  true;
            api.emit('dragStart', [...items]);
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
            item.deltaX = deltaX - gridOffsetX;
            item.deltaY = deltaY - gridOffsetY;
            FlowUtil.applyNodePosition(item);
        })
        
        FlowUtil.applyAllLinkPositions(api);
        //api.emit('drag', [...items]);
    }

    const onUp = (e: PointerEvent) => {
        if (active && e.isPrimary){

            let deltaXRaw = (e.pageX - startX) / state.transform.scale;
            let deltaYRaw = (e.pageY - startY) / state.transform.scale;
            let deltaX: number = gridX !== 0 ? (gridX * Math.floor(deltaXRaw / gridX)) : deltaXRaw;
            let deltaY: number = gridY !== 0 ? (gridY * Math.floor(deltaYRaw / gridY)) : deltaYRaw;
            items.forEach(item => {
                let gridOffsetX = gridX !== 0 ? item.x % gridX : 0;
                let gridOffsetY = gridY !== 0 ? item.y % gridY : 0;
                let finalX = item.x + (deltaX - gridOffsetX);
                let finalY = item.y + (deltaY - gridOffsetY);
                item.x = finalX;
                item.y = finalY;
                item.deltaX = 0;
                item.deltaY = 0;
                item.el.style.transform = `translate(${finalX}px, ${finalY}px)`;
            });
    
            if (latched) {
                api.emit('dragEnd', [...items]);
                methods.recordAction('drag');
            }
            
            /**
             * Reset drag state
             */
            active = false;
            latched = false;
            items = [];
            startX = 0;
            startY = 0;

            api.unlock();
        }
    }

    return <const> {
        name: 'drag',
        onUpdate,
        onDown,
        onMove,
        onUp
    }
}

export default MXFlowDragTool;
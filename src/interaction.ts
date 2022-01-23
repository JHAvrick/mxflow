// import * as FlowTypes from 'types/flow.types.v2';
// import { EventEmitter, Listener } from 'util/event-emitter';
// import { getPublicInterface } from './methods';

// const EventToInteractionMap : { [key:string]: keyof FlowTypes.InteractionEventMap  } = <const> {
//     'contextmenu': 'contextmenu',
//     'pointerdown': 'down',
//     'pointerup': 'up',
//     'pointermove': 'move',
//     'wheel': 'wheel',
//     // 'keyup': 'keyup',
//     // 'keydown': 'keydown'
// }

// function MXFlowInteractions(api: FlowTypes.Api, methods: ReturnType<typeof getPublicInterface>){
//     const dom = api.dom;
//     const events = new EventEmitter();
//     let tools = new Map<string, FlowTypes.ActionHandler>();
//     let lastCoords = {
//         graphX: 0,
//         graphY: 0,
//         containerX: 0,
//         containerY: 0,
//         pageX: 0,
//         pageY: 0
//     } 

//     const emit = <K extends keyof FlowTypes.InteractionEventMap>(type: K, event: FlowTypes.InteractionEventMap[K]) => {
//         tools.forEach(tool => tool.listeners?.[type]?.(event))
//         events.emit(type, event);
//     }

//     const getEvent = (type: keyof FlowTypes.InteractionEventMap, e: Event) : FlowTypes.InteractionEvent => {
//         return {
//             type: type,
//             inGraph: true,
//             item: undefined,
//             event: e,
//             ...lastCoords
//         }
//     }

//     const resolveCoordinates = (e: PointerEvent | MouseEvent | WheelEvent) => {
//         let graphX, graphY; [graphX, graphY] = methods.pageToGraphPos(e.pageX, e.pageY);
//         let containerX, containerY; [containerX, containerY] = methods.getOffsetPos(e.pageX, e.pageY);
//         return {
//             graphX,
//             graphY,
//             containerX,
//             containerY,
//             pageX: e.pageX,
//             pageY: e.pageY
//         }
//     }

//     const handleKeyDown = (e: KeyboardEvent) => {
//         if (e.key === api.opts.select?.multiSelectKey){
//             emit('multidown', getEvent('multidown', e));
//         }
//     }

//     const handleKeyUp = (e: KeyboardEvent) => {
//         if (e.key === api.opts.select?.multiSelectKey){
//             emit('multiup', getEvent('multiup', e));
//         }
//     }

//     const handleEvent = (e: Event) => {
//         let type = EventToInteractionMap[e.type]!;
//         if (e instanceof PointerEvent || e instanceof MouseEvent || e instanceof WheelEvent){
//             let coords = lastCoords = resolveCoordinates(e);
//             let inGraph = false;
//             if (e.target instanceof HTMLElement){
//                 inGraph = e.target.closest(`#${dom.instanceId}`) != null;
//             }

//             let evt : FlowTypes.InteractionEvent = {
//                 inGraph: inGraph,
//                 item: inGraph ? methods.resolveItem(e) : undefined,
//                 event: e,
//                 type: type,
//                 ...coords
//             }

//             emit(type, evt);
//         }
//     }

//     const bindTools = (toolsToBind: Map<string, FlowTypes.ActionHandler>) => {
//         tools = toolsToBind
//     }

//     dom.containerEl.addEventListener('contextmenu', handleEvent);
//     dom.containerEl.addEventListener("wheel", handleEvent);
//     document.addEventListener('pointerdown', handleEvent);
//     document.addEventListener('pointerup', handleEvent);
//     document.addEventListener('keydown', handleKeyDown);
//     document.addEventListener('keyup', handleKeyUp);
//     document.addEventListener('pointermove', handleEvent);
//     const dispose = () => {
//         dom.containerEl.removeEventListener('contextmenu', handleEvent);
//         dom.containerEl.removeEventListener("wheel", handleEvent);
//         document.removeEventListener('pointerdown', handleEvent);
//         document.removeEventListener('pointerup', handleEvent);
//         document.removeEventListener('keydown', handleKeyDown);
//         document.removeEventListener('keyup', handleKeyUp);
//         document.removeEventListener('pointermove', handleEvent);
//         events.removeAllListeners();
//     }

//     return {
//         bindTools,
//         dispose,
//         on<K extends keyof FlowTypes.InteractionEventMap>(type: K, listener: (event: FlowTypes.InteractionEventMap[K]) => any){
//             events.on(type, listener);
//         },
//         removeListener<K extends keyof FlowTypes.FlowEventMap>(type: K, listener: Listener){
//             events.removeListener(type, listener);
//         }
//     }
// }

// export default MXFlowInteractions;
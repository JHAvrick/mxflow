import * as FlowTypes from 'types/flow.types.v2';
import * as FlowUtil from './flow-util';
import clone from 'lodash/clone';

const AddNodeDefaultOpts : FlowTypes.AddNodeOptions = {
    x: 0,
    y: 0,
    suppressEvent: false,
    ignoreAction: false,
    edges: []
}

const getPublicInterface = (api: FlowTypes.Api) => {
    //const opts = api.opts;
    const dom = api.dom;
    const state = api.state;
    const transform = api.state.transform;
    const emit = api.emit;
    
    // const panzoom = {
    //     //active: false,
    //     rootWidth: dom.rootEl.getBoundingClientRect().width,
    //     rootHeight: dom.rootEl.getBoundingClientRect().height,
    //     deltaX: 0,
    //     deltaY: 0,
    //     panStartX: 0,
    //     panStartY: 0,
    //     maxDeltaBottom: 0,
    //     maxDeltaRight: 0,
    //     lastMoveEvent: PointerEvent | null = null;
    // }

    const recordAction = (action: FlowTypes.ActionType) => {
        if (!api.opts.undo?.enabled) return;
        if (api.opts.undo?.actions?.includes(action)){
            state.undo.unshift({
                type: action,
                model: getModel()
            });

            if (state.undo.length > 50){
                state.undo.pop();
            }
            /**
             * Clear redo stack any time a new action was recorded
             */
            state.redo = [];
        }
    }

    const undo = () => {
        if (!api.opts.undo?.enabled) return;
        if (state.undo.length > 1){
            if (state.undo.length > 0){
                state.redo.unshift(state.undo.shift()!);
            }
            setModel(clone(state.undo[0]!.model));
        }
    }

    const redo = () => {
        if (!api.opts.undo?.enabled) return;
        if (state.redo.length > 0){
            if (state.redo.length > 0){
                state.undo.unshift(state.redo.shift()!);
            }
            setModel(clone(state.undo[0]!.model));
        }
    }

    const isSelected = (item: FlowTypes.SelectableItem | string) => {
        let key = typeof item === 'string' ? item : item.key;
        return state.selected.has(key);
    }

    const setSelected = (selected: FlowTypes.SelectableItem[] | Map<string, FlowTypes.SelectableItem>, opts?: FlowTypes.ActionExtendedOpts) => {
        let s = Array.isArray(selected) ? new Map(selected.map(item => [item.key, item])) : selected;
        if (state.selected.size !== 0 || s.size !== 0) {
            FlowUtil.removeItemClass(state.selected, FlowTypes.FlowClass.ItemSelected);
            state.selected = s;
            FlowUtil.addItemClass(state.selected, FlowTypes.FlowClass.ItemSelected);

            //If we didn't just select everything, enforce layers
            if (s.size !== 0 && state.selected.size < state.nodes.size){
                bringToTop(<FlowTypes.Node[]> Array.from(selected.values()).filter(item => item.type === 'node'));
            }
        }

        if (!opts?.suppressEvent) emit('selected', new Map(state.preselected));
        if (!opts?.ignoreAction) recordAction('select');
    }

    /**
     * Add one or more items to the current selection.
     */
     const addToSelection = (items: FlowTypes.SelectableItem[], opts?: FlowTypes.ActionExtendedOpts) => {
        items.forEach(item => {
            state.selected.set(item.key, item);
            FlowUtil.addItemClass(item, FlowTypes.FlowClass.ItemSelected);
        });

        bringToTop(<FlowTypes.Node[]> Array.from(items.values()).filter(item => item.type === 'node'));

        if (!opts?.suppressEvent) emit('selected', new Map(state.selected));
        if (!opts?.ignoreAction) recordAction('select');
    }
    
        /**
         * Remove one or more items from the current selection.
         */
    const removeFromSelection = (keys: string[], opts?: FlowTypes.ActionExtendedOpts) => {
        keys.forEach(key => {
            let selection = state.selected.get(key);
            if (selection){
                FlowUtil.removeItemClass(selection, FlowTypes.FlowClass.ItemSelected);
                state.selected.delete(key);
            }
        });

        if (!opts?.suppressEvent) emit('selected', new Map(state.selected));
        if (!opts?.ignoreAction) recordAction('select');
    }

    const bringToTop = (nodes: FlowTypes.Node[]) => {
        let toTop = nodes.sort((a, b) => (a.z > b.z) ? 1 : -1); //Sort given nodes
        let toTopSet = new Set(toTop); 
        let all = Array.from(state.nodes.values()).sort((a, b) => (a.z > b.z) ? 1 : -1); //Sort all nodes
        
        /**
         * Take any node NOT in the given node set and move all thier indexes down.
         * For some nodes, the index may move down by more than 1.
         */
        let lastZ = api.opts.zIndexStart!; //Our counter
        all.forEach(node => {
            if (!toTopSet.has(node)){
                node.z = lastZ;
                node.el.style.zIndex = node.z.toString();
                lastZ = lastZ + 1;
            }
        })

        /**
         * Relayer our given node set to the top of the list, but maintain the
         * previous z-indexes within the list (this is already done by sorting)
         */
        let toTopBaseZ = lastZ + toTop.length;
        toTop.forEach((node, i) => {
            node.z = toTopBaseZ + i;
            node.el.style.zIndex = node.z.toString();
        })

        //TODO:
        //api.dom.lassoEl.style.zIndex = (toTop[toTop.length - 1].z + 1).toString();
    }   

    const setPreselected = (preselected: FlowTypes.SelectableItem[] | Map<string, FlowTypes.SelectableItem>, opts?: Pick<FlowTypes.ActionExtendedOpts, 'suppressEvent'>) => {
        let s = Array.isArray(preselected) ? new Map(preselected.map(item => [item.key, item])) : preselected;
        if (state.preselected.size !== 0 || s.size !== 0) {
            FlowUtil.removeItemClass(state.preselected, FlowTypes.FlowClass.ItemPreselected);
            state.preselected = s;
            FlowUtil.addItemClass(state.preselected, FlowTypes.FlowClass.ItemPreselected);
        }

        if (!opts?.suppressEvent) emit('preselected', new Map(state.preselected));
    }

    const removeItem = (type: FlowTypes.FlowItemType, key: string, opts?: FlowTypes.ActionExtendedOpts) => {
        let item = getItem(type, key);
        if (item){
            switch (item.type){
                case 'node': removeNode(item.key, opts); return;
                case 'link': removeLink(item.key, opts); return;
                case 'edge': removeEdge(item.key, opts); return;
            }
        }
    }

    const removedSelectedItems = () => {
        let ignoreSingleActions = state.selected.size > 1;

        state.selected.forEach(item => {
            removeItem(item.type, item.key, {
                suppressEvent: false,
                ignoreAction: ignoreSingleActions //We will use batch "removeItems" if more than one item is being removed
            })
        });

        //Record our batch action only if more than one item was removed
        if (ignoreSingleActions){
            recordAction('removeItems');
        }
    }

    const getItem = (type?: string | null, key?: string | null) : FlowTypes.FlowItem | undefined =>  {
        let item: FlowTypes.FlowItem | undefined;
        if (type === 'graph'){
            return state.root;
        } else if (key && type === 'node') {
            item = state.nodes.get(key);
        } else if (key && type === 'edge') {
            item = state.edges.get(key);
        } else if (key && type === 'link'){
            item = state.links.get(key)!;
        }
        return item;
    }

    const resolveItem = (e: PointerEvent | MouseEvent) => {
        let item: FlowTypes.FlowItem | undefined;
        if (e.target && e.target instanceof Element){
            let closestGraph = e.target.closest(`#${dom.instanceId}`);
            if (!closestGraph){
                return;
            }
            
            let closestItem = e.target.closest(`[${FlowTypes.FlowAttr.Type}]`);
            if (closestItem){
                closestItem.getAttribute
                item = getItem(
                    closestItem.getAttribute(FlowTypes.FlowAttr.Type), 
                    closestItem.getAttribute(FlowTypes.FlowAttr.Key)
                );
            }
        }
        return item;
    }

    const setEdgeContent = (nodeKey: string, edgeKey: string, content: HTMLElement | string) => {
        let edge = state.edges.get(`${nodeKey}:${edgeKey}`);
        if (edge){
            if (content instanceof HTMLElement){
                edge.el.innerHTML = '';
                edge.el.appendChild(content);
            } else {
                edge.el.innerHTML = '';
                edge.el.insertAdjacentHTML('afterbegin', content);
            }
        }
        throw new Error(`MXFlow: Attempted to set edge content on edge which doesn't exist (key="${`${nodeKey}:${edgeKey}`}")`);
    }

    const addEdge = (group: string, nodeKey: string, edgeKey: string, opts?: FlowTypes.ActionExtendedOpts) : FlowTypes.Edge => {
        let key = `${nodeKey}:${edgeKey}`;
        if (!state.edges.has(key)){
            let node = state.nodes.get(nodeKey);
            if (node){
                let edge = FlowUtil.createEdge(node, group, edgeKey);
                state.edges.set(key, edge);

                //if (content) setEdgeContent(nodeKey, edgeKey, content);
                render(edge);

                //Append edge to node
                edge.group.groupEl.appendChild(edge.el);
                // let targetList = type === 'input' ? node.inputsEl : node.outputsEl;
                //     targetList.appendChild(edge.el);
                
                if (!opts?.suppressEvent) emit('edgeAdded', edge);       
                if (!opts?.ignoreAction) recordAction('addEdge');
                
                return edge;
            }
            throw new Error(`MXFlow: Attempted to add edge to node which doesn't exist (key="${key}")`);
        }
        throw new Error(`MXFlow: Attempted to add edge with a key that already exists (key="${key}")`);
    }

    const removeEdge = (key: string, opts?: FlowTypes.ActionExtendedOpts) => {
        let edge = state.edges.get(key);
        if (edge){
            if (api.opts.beforeEdgeRemoved && !api.opts.beforeEdgeRemoved(edge)) return;
            edge.el.remove();
            state.edges.delete(key);

            if (!opts?.suppressEvent) emit('edgeRemoved', edge);
            if (!opts?.ignoreAction) recordAction('removeEdge');
            
            return;
        }
        throw new Error(`MXFlow: No edge exists with key="${key}"`);
    }

    const setNodeContent = (nodeKey: string, content: HTMLElement | string) => {
        let node = state.nodes.get(nodeKey);
        if (node){
            if (content instanceof HTMLElement){
                node.contentEl.innerHTML = ''
                node.contentEl.appendChild(content);
            } else {
                node.contentEl.innerHTML = ''
                node.contentEl.insertAdjacentHTML('afterbegin', content);
            }
        }
        throw new Error(`MXFlow: Attempted to set node content on node which doesn't exist (key="${nodeKey}")`);
    }

    const addNode = (nodeKey: string, options: FlowTypes.AddNodeOptions = {}) => {
        let opts = { ...AddNodeDefaultOpts, ...options }
        if (!state.nodes.has(nodeKey)){
            //Create the node 

            let node = FlowUtil.createNode(nodeKey, opts.x || 0, opts.y || 0, state.nodes.size + 1, api.opts.nodeHTMLTemplate);
            state.nodes.set(nodeKey, node);

            //Create edges
            options.edges?.forEach(config => {
                addEdge(config.group, nodeKey, config.key, { suppressEvent: true, ignoreAction: true })
            })

            
            render(node);

            //Add node and bind position
            dom.nodeContainerEl.appendChild(node.el);
            FlowUtil.applyNodePosition(node);

            //Emit event and record action of configured
            if (!opts?.suppressEvent) emit('nodeAdded', node);
            if (!opts?.ignoreAction) recordAction('addNode');
            return;
        }

        throw new Error(`MXFlow: Attempted to add a node with a key that already exists (key="${nodeKey}")`);
    }

    const removeNode = (key: string, opts?: FlowTypes.ActionExtendedOpts) => {
        let node = state.nodes.get(key);
        if (node){
            if (api.opts.beforeNodeRemoved && !api.opts.beforeNodeRemoved(node)) return;

            //Clear from selection
            if (state.selected.has(key)){
                removeFromSelection([key], { suppressEvent: true, ignoreAction: true });
            }

            //clear links
            state.links.forEach(link => {
                if (link.fromNode === node?.key || link.toNode === node?.key){
                    link.el.remove();
                    state.links.delete(link.key);
                }
            });

            //clear edges
            state.edges.forEach((edge) => {
                if (edge.nodeKey === node?.key){
                    edge.el.remove();
                    state.edges.delete(edge.key);
                }
            })

            //this.emit('beforeNodeRemoved', node);
            node.el.remove();
            state.nodes.delete(key);

            if (!opts?.suppressEvent){
                emit('nodeRemoved', node);
            }

            //Add action to undo stack if configured            
            if (!opts?.ignoreAction){
                recordAction('removeNode');
            }

            return;
        }
        throw new Error(`MXFlow: No node exists with key="${key}"`);
    }

    const addLink = (fromNode: string, fromEdge: string, toNode: string, toEdge: string, opts?: FlowTypes.ActionExtendedOpts) => {
        let params = { fromNode, fromEdge, toNode, toEdge };
        let from = state.edges.get(`${fromNode}:${fromEdge}`);
        let to = state.edges.get(`${toNode}:${toEdge}`);
        if (!from || !to){
            throw new Error(`MXFlow.addLink(): One or both edges missing "${fromEdge}", "${toEdge}"`);
        }

        //Swap direction if provided backwards
        // if (from.type === 'input'){
        //     throw new Error(`MXflow.addLink(): The "from" edge must be of type 'output'.`);
        // }

        if (!isLinkValid(from, to)){
            throw new Error(`MXFlow.addLink(): Invalid link.`)
        }

        let key = FlowUtil.getLinkCompositeKey(params);
        if (!state.links.has(key)){
            let link = FlowUtil.createLink(params);
            state.links.set(key, link);
            dom.linkContainerEl.appendChild(link.el);
            FlowUtil.applyLinkPosition(api, link);

            if (!opts?.suppressEvent){
                emit('linkAdded', link);
            }

            //Add action to undo stack if configured            
            if (!opts?.ignoreAction){
                recordAction('addLink');
            }

            return;
        }
        throw new Error(`MXFlow: Attempted to add link which already exists (key="${key}")`);
    }

    const removeLink = (key: string, opts?: FlowTypes.ActionExtendedOpts) => {
        //let key = FlowUtil.getLinkCompositeKey({ fromNode, fromEdge, toNode, toEdge });
        let link = state.links.get(key);
        if (link){
            if (api.opts.beforeLinkRemoved && !api.opts.beforeLinkRemoved(link)) return;
            if (state.selected.has(key)){
                removeFromSelection([key], { suppressEvent: true, ignoreAction: true });
            }

            link.el.remove();
            state.links.delete(key);

            if (!opts?.suppressEvent){
                emit('linkRemoved', link);
            }

            //Add action to undo stack if configured            
            if (!opts?.ignoreAction){
                recordAction('removeLink');
            }

            return;
        }
    }

    const isLinkValid = (fromEdge: FlowTypes.Edge, toEdge: FlowTypes.Edge) => {
        if (fromEdge && toEdge){
            if (fromEdge.nodeKey === toEdge.nodeKey) return false; //Check if edges are on same node
            if (fromEdge.group.groupKey === toEdge.group.groupKey) return false; //Check if type matches
            if (state.links.has(`${fromEdge.nodeKey}:${fromEdge.edgeKey}:${toEdge.nodeKey}:${toEdge.edgeKey}`)) return false; //Check if link already exists
            if (state.links.has(`${toEdge.nodeKey}:${toEdge.edgeKey}:${fromEdge.nodeKey}:${fromEdge.edgeKey}`)) return false;
            if (api.opts.linkValidator && !api.opts.linkValidator(fromEdge, toEdge)) return false; //User validation
            return true;
        }
        return false;
    }

    const openContextMenu = (graphX: number, graphY: number, target: FlowTypes.FlowItem, opts?: { suppressEvent: boolean }) => {
        renderContext(target);
        dom.contextEl.style.left = `${graphX}px`;
        dom.contextEl.style.top = `${graphY}px`;
        dom.contextEl.style.display = 'block';
        state.contextOpen = true;
        if (!opts?.suppressEvent){
            emit('contextOpened', target);
        }
    }

    const closeContextMenu = (opts?: { suppressEvent: boolean }) => {
        dom.contextEl.style.display = 'none';
        state.contextOpen = false;
        if (!opts?.suppressEvent){
            emit('contextClosed');
        }
    }

    const clear = (opts?: FlowTypes.ActionExtendedOpts) => {
        state.preselected.clear();
        state.selected.clear();
        state.nodes.clear();
        state.edges.clear();
        state.links.clear();
        dom.linkContainerEl.innerHTML = '';
        dom.nodeContainerEl.innerHTML = '';
        if (!opts?.suppressEvent) emit('cleared');
        if (!opts?.ignoreAction) recordAction('clear');
    }

    /**
     * Retrieves the current model which can be used to reset to a previous state
     * using setModel()
     */
     const getModel = () : FlowTypes.Model => {
        let model : FlowTypes.Model = {
            transform: state.transform,
            nodes: {},
            links: {},
            edges: {}
        }

        state.nodes.forEach(node => {
            model.nodes[node.key] = {
                selected: state.selected.has(node.key),
                x: node.x,
                y: node.y
            }
        })

        state.edges.forEach(edge => {
            model.edges[edge.key] = {
                nodeKey: edge.nodeKey,
                edgeKey: edge.edgeKey,
                groupKey: edge.group.groupKey
            }
        })

        state.links.forEach(link => {
            model.links[link.key] = {
                selected: state.selected.has(link.key),
                fromNode: link.fromNode,
                fromEdge: link.fromEdge,
                toNode: link.toNode,
                toEdge: link.toEdge
            }
        })

        return model;
    }

    /**
     * Build graph from a previous model. Optionally provide a hook which returns HTML content for 
     * any items with a content section. This method is asynchronous because of the way clientBoundingRect()
     * is calculated (not synchronously)
     */
    const setModel = async (model: FlowTypes.Model) => {
        clear({ suppressEvent: true, ignoreAction: true });

        //TODO: Set transform???
        Object.entries(model.nodes).forEach(entry => {
            addNode(entry[0], {
                x: entry[1].x,
                y: entry[1].y,
                suppressEvent: false,
                ignoreAction: true
            })

            if (entry[1].selected){
                addToSelection([state.nodes.get(entry[0])!], { ignoreAction: true });
            }
        })

        Object.entries(model.edges).forEach(entry => {
            addEdge(
                entry[1].groupKey, 
                entry[1].nodeKey, 
                entry[1].edgeKey,
                { ignoreAction: true }
            )
        })

        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                Object.entries(model.links).forEach(entry => {
                    addLink(
                        entry[1].fromNode, 
                        entry[1].fromEdge,
                        entry[1].toNode, 
                        entry[1].toEdge,
                        { ignoreAction: true }
                    )
                    
                    if (entry[1].selected){
                        addToSelection([state.links.get(entry[0])!], { ignoreAction: true });
                    }
                })

                //emit('modelChange', model);
                resolve(null);
            })
        })
    }
    
    //If complete, clear existing content
    
    const render = (item: FlowTypes.RenderableItem) => {
        if (api.opts.render){
            let cachedContent = api.renderCache.get(item.key); //Get any cached content for the item w/ the given key
            let renderTarget: HTMLElement | null = null, 
            nextContent = api.opts.render(item, cachedContent);

            if (item.type === FlowTypes.FlowItemType.Node){
                renderTarget = item.contentEl;
            /*
             * Target is an edge, input or output
             */
            } else if (item.type === FlowTypes.FlowItemType.Edge){
                renderTarget = item.el;
            }

            /**
             * If new content was returned, empty the target element, insert and cache the new content
             */
            if (!renderTarget) return;
            if (nextContent){
                renderTarget.innerHTML = '';
                if (typeof nextContent === 'string'){
                    renderTarget.insertAdjacentHTML('afterbegin', nextContent);
                } else {
                    renderTarget.appendChild(nextContent);
                }

                /**
                 * Cache the HTML content
                 */
                api.renderCache.set(item.key, renderTarget.firstElementChild);
            }
        }
    }

    const renderContext = (item: FlowTypes.FlowItem) => {
        let renderTarget = dom.contextEl;
        let nextContent = api.opts.renderContext?.(item);
        if (nextContent){
            renderTarget.innerHTML = '';
            if (typeof nextContent === 'string'){
                renderTarget.insertAdjacentHTML('afterbegin', nextContent);
            } else {
                renderTarget.appendChild(nextContent);
            }
        }
    }

    const applyTransform = (transition: boolean | number = false) => {
        if (typeof transition === 'number' || transition === true){
            dom.rootEl.style.transition = `transform ${typeof transition === 'number' ? transition : 300}ms`;
        }
        dom.rootEl.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
    }

    type SetViewOptions = {
        x?: number,
        y?: number,
        scale?: number,
        scaleSteps?: number,
        transition?: boolean | number
    } & FlowTypes.ActionExtendedOpts;

    /**
     * 
     * @param graphX
     * @param graphY 
     * @returns 
     */
    const getOffsetPos = (graphX: number, graphY: number) => {
        let x = (graphX - dom.containerEl.offsetLeft);
        let y = (graphY - dom.containerEl.offsetTop);
        return [x, y];
    }

   /**
     * Converts a set of coordinates on the page to a position within the graph, factoring graph offset.
     * 
     * @param pageX - The page x position
     * @param pageY - The page y position
     */
    const pageToGraphPos = (pageX: number, pageY: number) => {
        let x = (Math.abs(transform.x) + (pageX - dom.containerEl.offsetLeft)) / transform.scale;
        let y = (Math.abs(transform.y) + (pageY - dom.containerEl.offsetTop)) / transform.scale;
        return [x, y];
    }

    /**
     * Translate or zoom to any coordinates within the graph.
     * 
     * @param {Object} opts - Options object
     * @param {number} opts.x - New x coordinate
     * @param {number} opts.y - New y coordinate
     * @param {number} opts.scale - Provide a new scale between the configured min/max. Must be a positive number. Overrides the `scaleSteps` option.
     * @param {number} opts.scaleStep - Alternative zoom method. Provide the number of steps (positive or negative) to zoom. The
     * size of the step is determined by the `panzoom.scaleStep` configuration property.
     * @param {number | boolean} opts.transition - Pass `false` to use no smooth transition, `true` to use the default transition `300ms`, or a custom
     * transition time in milliseconds.
     * @returns 
     */
    const setView = (opts: SetViewOptions) => {
        if (api.isLocked()) return; //Ignore setView if our control is locked

        let rootRect = dom.rootEl.getBoundingClientRect();
        let width = rootRect.width;
        let height = rootRect.height;
        let transformX = transform.x;
        let trasnformY = transform.y;
        let scale = transform.scale;
        let minScale = api.opts.panzoom?.minScale || .05;
        let maxScale = api.opts.panzoom?.maxScale || 2;
        let stepIncrement = api.opts.panzoom?.scaleStep || .25;
        let scalePageX = opts.x ?? transform.x; //- dom.containerEl.offsetLeft;
        let scalePageY = opts.y ?? transform.y; //- dom.containerEl.offsetTop;

        /**
         * Not sure why but it seems unecessary to calculate a translateX here as done in panzoom.
         */
        let translateX = -((scalePageX - transformX) / scale); 
        let translateY = -((scalePageY - trasnformY) / scale);

        /**
         * Get our next scale either by the given explicit scale or by scale step.
         * If both are provided, the explicit scale is used.
         */
        let nextScale: number = transform.scale;
        if (opts.scale){
            nextScale = opts.scale;
        } else if (opts.scaleSteps) {
            nextScale = parseFloat((scale + (opts.scaleSteps * stepIncrement)).toFixed(2));
        }

        //if (nextScale < minScale || nextScale > maxScale) return;
        if (nextScale < minScale || nextScale > maxScale) nextScale = transform.scale;

        /**
         * Get x and y accounting for new scale
         */
        let nextX = translateX * nextScale;
        let nextY = translateY * nextScale;

        /**
         * Use our next scale to calculate what the max x (left) and y (top) position will be.
         */ 
        let containerRect = dom.containerEl.getBoundingClientRect();
        let maxX = (width * nextScale - containerRect.width);
        let maxY = (height * nextScale - containerRect.height);

        /**
         * Enforce max x/y positions. 
         */ 
        if (nextX > 0) nextX = 0;
        if (nextY > 0) nextY = 0;
        if (nextX < -maxX) nextX = -maxX;
        if (nextY < -maxY) nextY = -maxY;

        /**
         * Update our values and apply
         */ 
        api.state.transform.scale = nextScale;
        api.state.transform.x = nextX;
        api.state.transform.y = nextY;

        applyTransform(opts.transition ?? true);

        if (!opts.suppressEvent) emit('transform', { ...transform });
        // if (!opts.ignoreAction) recordAction('zoom');

        //TODO: transform action here?
    }

    const focus = (node: FlowTypes.Node) => {
        let containerRect = dom.containerEl.getBoundingClientRect();
        let nodeRect = node.el.getBoundingClientRect();

        

        let nextX = node.x// + dom.containerEl.offsetLeft;
        let nextY = node.y// + dom.containerEl.offsetTop;

        console.log(node.x, node.y);

        setView({ x: nextX, y: nextY });

        //transform.x = -(node.x - dom.containerEl.offsetLeft); //-(node.x + (containerRect.width / 2) + (nodeRect.width / 2));
        //transform.y = -(node.y;//-(node.y + (containerRect.height / 2) + (nodeRect.height / 2));

        applyTransform();
    }

    const getDom = () => api.dom;
    const getNodes = () => new Map(state.nodes);
    const getEdges = () => new Map(state.edges);
    const getLinks = () => new Map(state.links);

    return {
        recordAction,
        undo,
        redo,
        addEdge,
        removeEdge,
        setEdgeContent,
        addNode,
        removeNode,
        setNodeContent,
        addLink,
        removeLink,
        isLinkValid,
        isSelected,
        setSelected,
        setPreselected,
        addToSelection,
        removeFromSelection,
        removeItem,
        removedSelectedItems,
        openContextMenu,
        closeContextMenu,
        getItem,
        resolveItem,
        clear,
        getModel,
        setModel,
        getDom,
        getNodes,
        getEdges,
        getLinks,
        getOffsetPos,
        pageToGraphPos,
        setView,
        focus
    }
}

export { getPublicInterface };
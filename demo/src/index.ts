import '../../src/styles/default.css';
import '../../src/styles/dark.css';
import { MXFlowController, MXFlowControllerInstance } from '../../src/flow';
import { FlowItem} from '../../src/types/flow.types.v2';
import generateBackground from '../../src/helpers/background';
import DefaultModel from './model';
import * as dat from 'dat.gui';
import { nanoid } from 'nanoid'

let mxflow : MXFlowControllerInstance;

//The base template for each node
let template = /* HTML */ `
    <div data-mxflow-node-template>
        <ul data-mxflow-edge-group="inputs" data-mxflow-edge-latch="left">
            <!-- Input Edges Dynamically Populated -->
        </ul>
        <div data-mxflow-node-content>
            <!-- Node Content as Provided by User -->
        </div>
        <ul data-mxflow-edge-group="outputs" data-mxflow-edge-latch="right">
            <!-- Output Edges Dynamically Populated -->
        </ul>
    </div>
`

//Returns the content which is dynamically populated into the node template (`data-mxflow-node-content`).
const getNodeContent = (title: string) => {
    return /* HTML */ `
        <div>
            <div class="mxflow-node-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box" viewBox="0 0 16 16">
                    <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464z"/>
                </svg>  
                ${title}
            </div>
            <div class="mxflow-node-body" mx-content></div>
        </div>
    `;
}

//Returns an edge with a random color class and key
const edgeClasses = ['edge-cyan', 'edge-violet', 'edge-green', 'edge-blue', 'edge-orange'];
const getEdge = (group: 'inputs' | 'outputs') => {
    let edgeClass = edgeClasses[Math.floor(Math.random() * edgeClasses.length)];
    return {
        group,
        key: `edge-${nanoid()}`,
        class: edgeClass,
        data: {
            type: edgeClass
        }
    }
}

//Returns a somewhat random node variant
const getNodeConfig = (title: string, x: number, y: number) => {
    let variant = Math.floor(Math.random() * 5);
    switch (variant){
        case 0: //Returns an small node with two edges
            return { x, y, width: 160, height: 96, edges: [
                    getEdge('inputs'),
                    getEdge('outputs'),
                ]
            }
        case 1:
            return { x, y, width: 160, height: 128, edges: [
                    getEdge('inputs'),
                    getEdge('inputs'),
                    getEdge('outputs'),
                ]
            }
        case 2:
            return { x, y, width: 160, height:  128, edges: [
                    getEdge('inputs'),
                    getEdge('outputs'),
                    getEdge('outputs'),
                ]
            }
        case 3:
            return { x, y, width: 160, height: 160, edges: [
                    getEdge('inputs'),
                    getEdge('inputs'),
                    getEdge('inputs'),
                    getEdge('outputs'),
                    getEdge('outputs'),
                ]
            }
        case 4:
            return { x, y, width: 160, height: 160, edges: [
                    getEdge('inputs'),
                    getEdge('inputs'),
                    getEdge('outputs'),
                    getEdge('outputs'),
                    getEdge('outputs'),
                ]
            }
        case 5:
            return { x, y, width: 160, height: 192, edges: [
                    getEdge('inputs'),
                    getEdge('inputs'),
                    getEdge('inputs'),
                    getEdge('inputs'),
                    getEdge('outputs'),
                    getEdge('outputs'),
                    getEdge('outputs'),
                ]
            }
    }
}

//This method generate the correct context menu depending on which item type is targeted
const getContext = (item: FlowItem, x: number, y: number) => {
    let btn = document.createElement('button');
        btn.classList.add('mxflow-context-btn');

    switch (item.type){
        case 'node':
            btn.textContent = 'Delete Node -';
            btn.addEventListener('click', (e) => {
                mxflow.removeItem(item.type, item.key);
                mxflow.closeContextMenu();
            });
            return btn;
        case 'edge':
            btn.textContent = 'Delete Edge -';
            btn.addEventListener('click', (e) => {
                mxflow.removeItem(item.type, item.key);
                mxflow.closeContextMenu();
            });
            return btn;
        case 'link':
            btn.textContent = 'Delete Link -';
            btn.addEventListener('click', (e) => {
                mxflow.removeItem(item.type, item.key);
                mxflow.closeContextMenu();
            });
            return btn;
        case 'graph':
            btn.textContent = 'Add Node +';
            btn.addEventListener('click', (e) => {
                [x, y] = mxflow.pageToGraphPos(x, y);
                mxflow.addNode(`node-${nanoid()}`, getNodeConfig('Node', x, y));
                mxflow.closeContextMenu();
            });
            return btn;
    }
}

let root = document.getElementById('root');
if (root){
    mxflow = MXFlowController(root, {
        width: 5000,
        height: 2500,
        nodeHTMLTemplate: template,
        background: {
            type: 'grid',
            radius: 1.5,
            size: 32
        },
        panzoom: {
            minScale: .25,
            scaleStep: .1
        },
        renderContext: (item, x, y) => {
            return getContext(item, x, y);
        },
        render: (item, content, data) => {
            if (content) return content; //We only need to generate content for un-rendered items
            switch (item.type){
                case 'edge': //For edges, just return simple in/out labels
                    if (item.group.groupKey === 'inputs'){
                        return `<div class="edge-content input-edge ${item.data.type}"> In </div>`;
                    } else {
                        return `<div class="edge-content output-edge ${item.data.type}"> Out </div>`;
                    }
                case 'node':
                    if (item.key === 'actions'){
                        return `
                            <ul id="actions" class="mxflow-actions-list"></ul>
                        `
                    }
                    return getNodeContent('Node');
            }
        },
        linkValidator(startEdge, endEdge) {
            if (startEdge.data.type === endEdge.data.type){
                return true;
            }
            return false;
        },
    });

    //If a model was persisted to localStorage, attempt to load it
    let model = localStorage.getItem('model');
    if (model){
        mxflow.setModel(JSON.parse(model));
    } else {
        mxflow.setModel(DefaultModel);
    }

    //Everything below is just setting up the dat.gui controls
    const gui = new dat.GUI();
    const parameters = {
        background: 'grid',
        grid: false,
        gridX: 32,
        gridY: 32,
        removeSelected: function(){
            mxflow.removeSelectedItems();
        },
        focusSelected: function(){
            //Doesn't work right when scaled
            let selected = mxflow.getState().selected;
            if (selected.size > 0){
                mxflow.focusNode(selected.values().next().value, .9);
            }
        },
        undo: function(){
            mxflow.undo();
        },
        redo: function(){
            mxflow.redo();
        },
        persist: function(){
            let model = mxflow.getModel();
            localStorage.setItem('model', JSON.stringify(model));
            console.log('Persisting Model:', model);
        },
        reset: function(){
            localStorage.removeItem('model');
            mxflow.setModel(DefaultModel);
        }
    }

    let bgOptions = ['grid', 'dots'];
    let bgDotsMd = generateBackground('dots', 32, 1.5);
    let bgGrid = generateBackground('grid', 32, 1.5);
    gui.add(parameters, 'background', bgOptions).name('Background Type').onChange(function(value) {
        switch (value){
            case 'dots':
                mxflow.setBackground(bgDotsMd);
                break;
            case 'grid':
                mxflow.setBackground(bgGrid);
                break;
        }
    });

    let gridX = 32, gridY = 32;
    gui.add(parameters, 'grid').name('Enable Grid').onChange(function(value) {
        mxflow.setDragOptions(value ? {
            gridX: gridX,
            gridY: gridY,
        } : {
            gridX: 0,
            gridY: 0
        })
    });

    gui.add(parameters, 'gridX').min(8).max(96).step(2).name('Grid X').onChange(function(value) {
        if (!parameters.grid) return;

        gridX = value;
        mxflow.setDragOptions({
            gridX: value,
            gridY: gridY,
        })
    });

    gui.add(parameters, 'gridX').min(8).max(96).step(2).name('Grid Y').onChange(function(value) {
        if (!parameters.grid) return;

        gridY = value;
        mxflow.setDragOptions({
            gridX: gridX,
            gridY: value,
        })
    });

    gui.add(parameters, 'undo').name('Undo (Ctrl + Z)');
    gui.add(parameters, 'redo').name('Redo (Ctrl + Y)');
    gui.add(parameters, 'removeSelected').name('Remove Selected (Delete)');
    gui.add(parameters, 'persist').name('Save State (localstorage)');
    gui.add(parameters, 'reset').name('Reset (localstorage)');
}
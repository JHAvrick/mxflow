import '../../src/styles/default.css';
import { MXFlowController, MXFlowControllerInstance } from '../../src/flow';
import { RenderableType, FlowItem, Edge } from '../../src/types/flow.types.v2';

let root = document.getElementById('root');
if (root){

    const render = (type: RenderableType, item: FlowItem) => {
        return `
            <div class="node"> ${type} </div>
        `
    }


    let template = /* HTML */ `
        <div data-mxflow-node-template>
            <ul data-mxflow-edge-group="inputs">
                <!-- Input Edges Dynamically Populated -->
            </ul>
            <ul data-mxflow-edge-group="center" data-mxflow-edge-latch="top">
                <!-- Input Edges Dynamically Populated -->
            </ul>
            <div data-mxflow-node-content>
                <!-- Node Content as Provided by User -->
            </div>
            <ul data-mxflow-edge-group="outputs">
                <!-- Output Edges Dynamically Populated -->
            </ul>
        </div>
    `

    let mxflow = MXFlowController(root, {
        nodeHTMLTemplate: template,
        drag: {
            gridX: 16,
            gridY: 16
        },
        renderContext: (item) => {
            return `<span> ${item.type} </span>`
        },
        render: (item, content) => {
            if (content) return content;
            switch (item.type){
                case 'edge':
                    if (item.group.groupKey === 'inputs'){
                        return `<div class="edge-content input-edge"></div>`;
                    } else {
                        return `<div class="edge-content output-edge"></div>`;
                    }
                case 'node':
                    return `<div class="node-content"> ${item.key} </div>`;
            }
        }
    });

    for (let i = 0; i < 25; i++){
        mxflow.addNode('node' + i, { 
            x: 32 * i,
            y: 32 * i,
            edges: [
                { group: 'inputs', key: 'input' },
                { group: 'outputs', key: 'output' },
                { group: 'center', key: 'misc' }
            ]
        });
    }
}
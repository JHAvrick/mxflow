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

    let mxflow = MXFlowController(root, {
        drag: {
            gridX: 32,
            gridY: 32
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
                { group: 'outputs', key: 'output' }
            ]
        });
    }

    // mxflow.addNode('test');
    // mxflow.addNode('test2');
    // mxflow.addNode('test3');
    // mxflow.addNode('test');
    // mxflow.addNode('test2');
    // mxflow.addNode('test3');
    // mxflow.addNode('test');
    // mxflow.addNode('test2');
    // mxflow.addNode('test3');
    // mxflow.addNode('test');
    // mxflow.addNode('test2');
    // mxflow.addNode('test3');
    // mxflow.addNode('test');
    // mxflow.addNode('test2');
    // mxflow.addNode('test3');
    
    // mxflow.on('selected', (d) => {
    //     console.log(d.forEach(item => {
    //         item.
    //     }));
    // })

}
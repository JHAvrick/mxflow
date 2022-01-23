import '../../src/styles/default.css';
import { MXFlowController, MXFlowControllerInstance } from '../../src/flow';
import { RenderableType, FlowItem, Edge } from '../../src/types/flow.types.v2';

let root = document.getElementById('root');
if (root){

    let template = /* HTML */ `
        <div data-mxflow-node-template>
            <ul data-mxflow-edge-group="inputs" data-mxflow-edge-latch="right">
                <!-- Input Edges Dynamically Populated -->
            </ul>
            <div data-mxflow-node-content>
                <!-- Node Content as Provided by User -->
            </div>
            <ul data-mxflow-edge-group="outputs" data-mxflow-edge-latch="left">
                <!-- Output Edges Dynamically Populated -->
            </ul>
        </div>
    `

    let mxflow = MXFlowController(root, {
        nodeHTMLTemplate: template,
        // drag: {
        //     gridX: 16,
        //     gridY: 16
        // },
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
                    let c = document.createElement('div');
                        c.classList.add('node-content');

                    let input = document.createElement('input');
                        input.classList.add('form-control', 'form-control-sm')
                        
                    c.insertAdjacentElement('afterbegin', input);

                    return c; //`<div class="node-content"> ${item.key} </div>`;
            }
        }
    });

    for (let i = 0; i < 5; i++){
        mxflow.addNode('node' + i, { 
            x: 1000 + (32 * i),
            y: 1000 + (32 * i),
            edges: [
                { group: 'inputs', key: 'input' },
                { group: 'inputs', key: 'input1' },
                { group: 'inputs', key: 'input2' },
                { group: 'inputs', key: 'input3' },
                { group: 'outputs', key: 'output1' },
                { group: 'outputs', key: 'output2' },
                { group: 'outputs', key: 'output3' },
                { group: 'outputs', key: 'output4' }
            ]
        });
    }

    // let nodeCount = 100;
    // root.addEventListener('mousedown', e => {
    //     let x,y; [x,y] = mxflow.pageToGraphPos(e.pageX, e.pageY);
    //     mxflow.addNode('newnode' + nodeCount, {
    //         x: x,
    //         y: y
    //     })
    //     nodeCount++;
    // })

    setTimeout(() => {
        //mxflow.setView({x: 320, y: 320, scale: 1.5});
        mxflow.focus(mxflow.getNodes().get('node0')!);
    }, 500)
}









let root2 = document.getElementById('root2');
if (root2){
    let template = /* HTML */ `
    <div data-mxflow-node-template>
        <ul data-mxflow-edge-group="inputs" data-mxflow-edge-latch="right">
            <!-- Input Edges Dynamically Populated -->
        </ul>
        <div data-mxflow-node-content>
            <!-- Node Content as Provided by User -->
        </div>
        <ul data-mxflow-edge-group="outputs" data-mxflow-edge-latch="left">
            <!-- Output Edges Dynamically Populated -->
        </ul>
    </div>
`

    let mxflow = MXFlowController(root2, {
        nodeHTMLTemplate: template,
        // drag: {
        //     gridX: 16,
        //     gridY: 16
        // },
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
                    let c = document.createElement('div');
                        c.classList.add('node-content');

                    let input = document.createElement('input');
                        input.classList.add('form-control', 'form-control-sm')
                        
                    c.insertAdjacentElement('afterbegin', input);

                    return c; //`<div class="node-content"> ${item.key} </div>`;
            }
        }
    });

    for (let i = 0; i < 5; i++){
        mxflow.addNode('node' + i, { 
            x: 1000 + (32 * i),
            y: 1000 + (32 * i),
            edges: [
                { group: 'inputs', key: 'input' },
                { group: 'inputs', key: 'input1' },
                { group: 'inputs', key: 'input2' },
                { group: 'inputs', key: 'input3' },
                { group: 'outputs', key: 'output1' },
                { group: 'outputs', key: 'output2' },
                { group: 'outputs', key: 'output3' },
                { group: 'outputs', key: 'output4' }
            ]
        });
    }
}
import '../../src/styles/default.css';
import '../../src/styles/blender.css';
import { MXFlowController, MXFlowControllerInstance } from '../../src/flow';
import { RenderableType, FlowItem, Edge, Node } from '../../src/types/flow.types.v2';
import generateBackground from '../../src/helpers/background';


let root1 = document.getElementById('root1');
if (root1){
    let template = /* HTML */ `
        <div data-mxflow-node-template>
            <ul data-mxflow-edge-group="inputs" data-mxflow-edge-latch="center">
                <!-- Input Edges Dynamically Populated -->
            </ul>
            <div data-mxflow-node-content>
                <!-- Node Content as Provided by User -->
            </div>
            <ul data-mxflow-edge-group="outputs" data-mxflow-edge-latch="center">
                <!-- Output Edges Dynamically Populated -->
            </ul>
        </div>
    `

    const getNodeContent = (title: string) => {
        return /* HTML */ `
            <div>
                <div class="mxflow-node-header">
                    ${title}
                </div>
                <div class="mxflow-node-body">
                    This is the node body!
                </div>
            </div>
        `;
    }

    let mxflow2 = MXFlowController(root1, {
        nodeHTMLTemplate: template,
        // drag: {
        //     gridX: 16,
        //     gridY: 16
        // },
        background: {
            type: 'dots',
            radius: 1.5,
            size: 28
        },
        panzoom: {
            minScale: .25
        },
        renderContext: (item) => {
            return `<span> ${item.type} </span>`
        },
        render: (item, content, data) => {
            console.log(content);
            if (content) return content;
            switch (item.type){
                case 'edge':
                    return '';
                    //let color = item.data.color;
                   
                    // if (item.group.groupKey === 'inputs'){
                    //     return `<div class="edge-content input-edge" ${color ? `style="background:${color};"` : ''}></div>`;
                    // } else {
                    //     return `<div class="edge-content output-edge" ${color ? `style="background:${color};"` : ''}></div>`;
                    // }
                case 'node':
                    return getNodeContent(item.key);
                    // let c = document.createElement('div');
                    //     c.classList.add('node-content');

                    // let input = document.createElement('input');
                    //     input.classList.add('form-control', 'form-control-sm')
                        
                    // c.insertAdjacentElement('afterbegin', input);

                    // return c; //`<div class="node-content"> ${item.key} </div>`;
            }
        }
    });

    for (let i = 0; i < 15; i++){
        mxflow2.addNode('node' + i, {
            x: 1000 + (5 * i),
            y: 1000 + (5 * i),
            width: 250,
            height: 400,
            class: [i % 2 ? 'mxflow-node--blue' : 'mxflow-node--purple'],
            edges: [
                { group: 'inputs', key: 'input' },
                { group: 'inputs', key: 'input1' },
                { group: 'inputs', key: 'input2'},
                { group: 'inputs', key: 'input3' },
                { group: 'outputs', key: 'output1' },
                { group: 'outputs', key: 'output2' },
                { group: 'outputs', key: 'output3' },
                { group: 'outputs', key: 'output4' }
            ]
        });
    }

    let bgSm = generateBackground('dots', 38, 2);
    let bgMd = generateBackground('dots', 28, 1.5);
    let bgLg = generateBackground('dots', 22, 1.5);
    mxflow2.on('transform', (t) => {
        if (t.scale < .75){
            mxflow2.setBackground(bgLg)
        } else if (t.scale < 1) {
            mxflow2.setBackground(bgMd)
        } else {
            mxflow2.setBackground(bgSm);
        }
    })

    // setTimeout(() => {
    //     mxflow2.focus(mxflow2.getNodes().get('node0')!, .9);
    // }, 3000)
}




// let root2 = document.getElementById('root2');
// if (root2){
//     let template = /* HTML */ `
//         <div data-mxflow-node-template>
//             <ul data-mxflow-edge-group="inputs" data-mxflow-edge-latch="right">
//                 <!-- Input Edges Dynamically Populated -->
//             </ul>
//             <div data-mxflow-node-content>
//                 <!-- Node Content as Provided by User -->
//             </div>
//             <ul data-mxflow-edge-group="outputs" data-mxflow-edge-latch="left">
//                 <!-- Output Edges Dynamically Populated -->
//             </ul>
//         </div>
//     `

//     let mxflow2 = MXFlowController(root2, {
//         nodeHTMLTemplate: template,
//         // drag: {
//         //     gridX: 16,
//         //     gridY: 16
//         // },
//         background: {
//             type: 'grid',
//             // size: 20
//         },
//         panzoom: {
//             minScale: .25
//         },
//         renderContext: (item) => {
//             return `<span> ${item.type} </span>`
//         },
//         render: (item, content, data) => {
//             if (content) return content;
//             switch (item.type){
//                 case 'edge':
//                     return '';
//                     //let color = item.data.color;
                   
//                     // if (item.group.groupKey === 'inputs'){
//                     //     return `<div class="edge-content input-edge" ${color ? `style="background:${color};"` : ''}></div>`;
//                     // } else {
//                     //     return `<div class="edge-content output-edge" ${color ? `style="background:${color};"` : ''}></div>`;
//                     // }
//                 case 'node':
//                     // let c = document.createElement('div');
//                     //     c.classList.add('node-content');

//                     // let input = document.createElement('input');
//                     //     input.classList.add('form-control', 'form-control-sm')
                        
//                     // c.insertAdjacentElement('afterbegin', input);

//                     // return c; //`<div class="node-content"> ${item.key} </div>`;
//             }
//         }
//     });

//     for (let i = 0; i < 100; i++){
//         mxflow2.addNode('node' + i, {
//             x: 1000 + (5 * i),
//             y: 1000 + (5 * i),
//             width: 200,
//             height: 200,
//             class: ['test', 'test2'],
//             edges: [
//                 { group: 'inputs', key: 'input' },
//                 { group: 'inputs', key: 'input1' },
//                 { group: 'inputs', key: 'input2'},
//                 { group: 'inputs', key: 'input3' },
//                 { group: 'outputs', key: 'output1' },
//                 { group: 'outputs', key: 'output2' },
//                 { group: 'outputs', key: 'output3' },
//                 { group: 'outputs', key: 'output4' }
//             ]
//         });
//     }

//     // setTimeout(() => {
//     //     mxflow2.focus(mxflow2.getNodes().get('node0')!, .9);
//     // }, 3000)
// }
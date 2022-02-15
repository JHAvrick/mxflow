import '../../src/styles/default.css';
import '../../src/styles/terminal.css';
import { MXFlowController, MXFlowControllerInstance } from '../../src/flow';
import { RenderableType, FlowItem, Edge, Node } from '../../src/types/flow.types.v2';

// let root = document.getElementById('root');
// if (root){

//     const makeNestedGraph = (parent: MXFlowControllerInstance, el: HTMLElement) => {
//         let mxflow = MXFlowController(el, {
//             parent: parent,
//             //panzoom: { enabled: false },
//             render: (item, content, data) => {
//                 if (data.condensed === undefined && content) return content;
//                 switch (item.type){
//                     case 'edge':
//                         if (item.group.groupKey === 'inputs'){
//                             return `<div class="edge-content input-edge"></div>`;
//                         } else {
//                             return `<div class="edge-content output-edge"></div>`;
//                         }
//                     case 'node':
//                         let c = document.createElement('div');
//                             c.classList.add('node-content');
//                             c.style.padding = '0px';
                            
    
//                         let input = document.createElement('input');
//                             input.classList.add('form-control', 'form-control-sm');
    
//                         if (data.condensed){
//                             c.style.minHeight = '100px';
//                         } else {
//                             c.style.minHeight = '200px';
//                         }
                            
//                         c.insertAdjacentElement('afterbegin', input);
    
//                         return c; //`<div class="node-content"> ${item.key} </div>`;
//                 }
//                 return content ?? '';
//             }
//         });

//         mxflow.addNode('test', { x: 1000, y: 1000 });
//         // setTimeout(() => {
//         //     mxflow.focus(<Node> mxflow.getItem('node', 'test')!, 1.5);
//         // }, 500)

//         return mxflow;
//     }

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

//     var lastCondensed = false, condensed = false;
//     let mxflow = MXFlowController(root, {
//         width: 1000,
//         height: 1000,
//         panzoom: {
//             minScale: .25,
//         },
//         nodeHTMLTemplate: template,
//         // drag: {
//         //     gridX: 16,
//         //     gridY: 16
//         // },
//         renderContext: (item) => {
//             return `<span> ${item.type} </span>`
//         },
//         render: (item, content, data) => {
//             if (data.condensed === undefined && content) return content;
//             switch (item.type){
//                 case 'edge':
//                     if (item.group.groupKey === 'inputs'){
//                         return `<div class="edge-content input-edge"></div>`;
//                     } else {
//                         return `<div class="edge-content output-edge"></div>`;
//                     }
//                 case 'node':

//                     if (item.key === 'nested'){
//                         let c = document.createElement('div');
//                             c.classList.add('node-content')
//                             c.style.width = '1000px';
//                             c.style.height = '500px';
//                             c.style.background = 'white';

//                             let nesty = makeNestedGraph(mxflow, c);
//                             // nesty.on('transform', (e) => {
//                             //     console.log(nesty.getCompositeScale());
//                             // })

//                             return c;
//                     }

//                     // let c = document.createElement('div');
//                     //     c.classList.add('node-content');
                        

//                     // let input = document.createElement('input');
//                     //     input.classList.add('form-control', 'form-control-sm');

//                     // if (data.condensed){
//                     //     c.style.minHeight = '100px';
//                     // } else {
//                     //     c.style.minHeight = '200px';
//                     // }
                        
//                     // c.insertAdjacentElement('afterbegin', input);

//                     //return c; //`<div class="node-content"> ${item.key} </div>`;
//             }
//             return content ?? '';
//         }
//     });

//     mxflow.addNode('nested');

//     // for (let i = 0; i < 10; i++){
//     //     mxflow.addNode('node' + i, { 
//     //         x: 1000 + (32 * i),
//     //         y: 2000 + (32 * i),
//     //         edges: [
//     //             { group: 'inputs', key: 'input' },
//     //             { group: 'inputs', key: 'input1' },
//     //             { group: 'inputs', key: 'input2' },
//     //             { group: 'inputs', key: 'input3' },
//     //             { group: 'outputs', key: 'output1' },
//     //             { group: 'outputs', key: 'output2' },
//     //             { group: 'outputs', key: 'output3' },
//     //             { group: 'outputs', key: 'output4' }
//     //         ]
//     //     });
//     // }


//     mxflow.on('transform', (e) => {
//         condensed = e.scale <= .5;
//         if (condensed !== lastCondensed){
//             mxflow.renderAll({ condensed: condensed });
//         }
//         lastCondensed = condensed;
//     })

//     // let nodeCount = 100;
//     // root.addEventListener('mousedown', e => {
//     //     let x,y; [x,y] = mxflow.pageToGraphPos(e.pageX, e.pageY);
//     //     mxflow.addNode('newnode' + nodeCount, {
//     //         x: x,
//     //         y: y
//     //     })
//     //     nodeCount++;
//     // })

//     setTimeout(() => {
//         //mxflow.focus(mxflow.getNodes().get('node0')!);


//         // setTimeout(() => {
//         //     mxflow.updateNodeTemplate('node0', `
//         //         <div data-mxflow-node-template style="border-radius:100%;">
//         //             <ul data-mxflow-edge-group="inputs" data-mxflow-edge-latch="right">
//         //                 <!-- Input Edges Dynamically Populated -->
//         //             </ul>
//         //             <div data-mxflow-node-content>
//         //                 <!-- Node Content as Provided by User -->
//         //             </div>
//         //             <ul data-mxflow-edge-group="outputs" data-mxflow-edge-latch="left">
//         //                 <!-- Output Edges Dynamically Populated -->
//         //             </ul>
//         //         </div>
//         //     `);
//         // }, 1000)



//         // mxflow.setView({x: 320, y: 320, scale: 1.5, transition: false });
//         // setTimeout(() => {
            
//         // }, 500)
//     }, 2000)
// }









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

    let mxflow2 = MXFlowController(root2, {
        nodeHTMLTemplate: template,
        // drag: {
        //     gridX: 16,
        //     gridY: 16
        // },
        background: {
            type: 'grid'
        },
        panzoom: {
            minScale: .25
        },
        renderContext: (item) => {
            return `<span> ${item.type} </span>`
        },
        render: (item, content, data) => {
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
                    // let c = document.createElement('div');
                    //     c.classList.add('node-content');

                    // let input = document.createElement('input');
                    //     input.classList.add('form-control', 'form-control-sm')
                        
                    // c.insertAdjacentElement('afterbegin', input);

                    // return c; //`<div class="node-content"> ${item.key} </div>`;
            }
        }
    });

    for (let i = 0; i < 5; i++){
        mxflow2.addNode('node' + i, {
            x: 1000 + (32 * i),
            y: 1000 + (32 * i),
            width: 200,
            height: 200,
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
}
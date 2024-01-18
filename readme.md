# MXflow

This project is a proof-of-concept for a node-graph editor in vanilla TypeScript with component-based framework integrations in mind. This is really just a showcase and is not intended or sufficient for production use cases.

[Try the Demo](https://jhavrick.github.io/mxflow/) \
[GIF Previews](#previews) \
[Basic Example](#example) 
<!-- [API Documentation](#api-documentation) -->

MXFlow currently supports the following features:
 - Custom Nodes, Edges, Links
 - Custom Drag Grid
 - Drag Handles
 - Automatic Node Layering
 - Select
 - Multi-Select
 - Lasso Select
 - Pan / Zoom
 - Undo / Redo 
 - Custom Control Scheme
 - Context Menu
 - Link Validation
 - Model Hydration
 - Custom Background
 - Portal Rendering (for Vue, React, Svelte, etc.)

Touch screen support is basically non-existent and there are a number of other partial or poorly-implemented features such as the ability to focus a specific node or automatically arrange nodes.

Of course, if you're looking for an actual solution there really isn't a better option out there than [react-flow](https://reactflow.dev/).

# Example

### Node Template

 First define a node template. This is just the "scaffolding" used for each node. Multiple templates canbe used at once. The node's content is provided in a `render` method which is provided in the config.

```html
<div data-mxflow-node-template>
    <ul data-mxflow-edge-group="inputs" data-mxflow-edge-latch="left">
        <!-- Input edges dynamically populated -->
    </ul>
    <div data-mxflow-node-content>
        <!-- Node content provided during render -->
    </div>
    <ul data-mxflow-edge-group="outputs" data-mxflow-edge-latch="right">
        <!-- Output edges dynamically populated -->
    </ul>
</div>
```
These data attributes tell MXFlow which area of the node is being scaffolded. The available data attributes can be found on the `FlowAttr` enum.

### MXFlow Instance

Next we can define out instance with minimal configuration. See the `Options` type for complete list of documented options.

```typescript
let root = document.getElementById('root');
if (root){
    const mxflow = MXFlowController(root, {
        width: 5000,
        height: 2500,
        nodeHTMLTemplate: template, //As defined above
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
            //You can build any context menu here
            return `Target: ${item.type}`;
        },
        render: (item, content, data) => {
            //We only need to generate content for un-rendered items
            if (content) return content; 
            switch (item.type){
                case 'node': //Return basic node content
                    return `
                        <div>
                            <div class="mxflow-node-header">
                                ${title}
                            </div>
                            <div class="mxflow-node-body" mx-content>
                                
                            </div>
                        </div>
                    `;
            }
        }
    });
}
```

### Adding a Node

Then we can programmatically add a node. It's usually a good idea to size your nodes as increments of the grid size, if applicable. Note that when we add edges we must specify a grouping. These groups are defined in the node template and are not necessarily restricted to just inputs and outputs.

```typescript
mxflow.addNode('key', { 
    x: 100, 
    y: 100, 
    width: 160, 
    height: 96, 
    edges: [
        { group: 'inputs', key: `input-1` },
        { group: 'inputs', key: `input-2` },
        { group: 'outputs', key: `output-1` },
        { group: 'outputs', key: `output-2` }
    ]
})
```
<!-- 
# API Documentation
 -->



# Previews

### Link Nodes
Nodes are linked by dragging from one edge to another. In this example, custom link validation is used to prevent incompatible edges from being connected.

![link](link.gif)

### Lasso
![lasso](lasso.gif)

### Undo
![undo](undo.gif)
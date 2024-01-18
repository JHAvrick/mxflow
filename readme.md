# MXflow

This project is a proof-of-concept for a node-graph editor in vanilla TypeScript with component-based framework integrations in mind. This is really just a showcase and is not intended or sufficient for production use cases.

[Try the Demo](https://jhavrick.github.io/mxflow/)

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

Below are some examples gifs, but you can also just try the demo.

## Link Nodes
![link](link.gif)

## Lasso
![lasso](lasso.gif)

## Undo
![undo](undo.gif)

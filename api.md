# MXFlow instance

### Methods

- [addEdge](api.md#addedge)
- [addLink](api.md#addlink)
- [addNode](api.md#addnode)
- [addToSelection](api.md#addtoselection)
- [applyTransform](api.md#applytransform)
- [bringToTop](api.md#bringtotop)
- [clear](api.md#clear)
- [closeContextMenu](api.md#closecontextmenu)
- [eventInGraph](api.md#eventingraph)
- [getCompositeScale](api.md#getcompositescale)
- [getDom](api.md#getdom)
- [getEdges](api.md#getedges)
- [getItem](api.md#getitem)
- [getLinks](api.md#getlinks)
- [getModel](api.md#getmodel)
- [getNodes](api.md#getnodes)
- [getState](api.md#getstate)
- [isLinkValid](api.md#islinkvalid)
- [isSelected](api.md#isselected)
- [openContextMenu](api.md#opencontextmenu)
- [pageToContainerPos](api.md#pagetocontainerpos)
- [pageToGraphPos](api.md#pagetographpos)
- [redo](api.md#redo)
- [removeEdge](api.md#removeedge)
- [removeFromSelection](api.md#removefromselection)
- [removeItem](api.md#removeitem)
- [removeLink](api.md#removelink)
- [removeNode](api.md#removenode)
- [removeSelectedItems](api.md#removeselecteditems)
- [render](api.md#render)
- [renderAll](api.md#renderall)
- [renderContext](api.md#rendercontext)
- [resolveItem](api.md#resolveitem)
- [setBackground](api.md#setbackground)
- [setModel](api.md#setmodel)
- [setPreselected](api.md#setpreselected)
- [setSelected](api.md#setselected)
- [setView](api.md#setview)
- [undo](api.md#undo)

## Variables

### api

• `Const` **api**: `FlowTypes.Api`

#### Defined in

methods.doc.ts:32

___

### focusNode

• **focusNode**: `any`

## Functions

### addEdge

▸ **addEdge**(`group`, `nodeKey`, `edgeKey`, `opts?`): `Edge`

Add an edge to an existing node and edge group.

#### Parameters

| Name | Type |
| :------ | :------ |
| `group` | `string` |
| `nodeKey` | `string` |
| `edgeKey` | `string` |
| `opts?` | `AddEdgeOptions` |

#### Returns

`Edge`

#### Defined in

methods.doc.ts:344

___

### addLink

▸ **addLink**(`fromNode`, `fromEdge`, `toNode`, `toEdge`, `opts?`): `void`

Create a new link between two edges

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromNode` | `string` |
| `fromEdge` | `string` |
| `toNode` | `string` |
| `toEdge` | `string` |
| `opts?` | `AddLinkOptions` |

#### Returns

`void`

#### Defined in

methods.doc.ts:514

___

### addNode

▸ **addNode**(`nodeKey`, `options?`): `void`

Add a new node to the graph with edges.

#### Parameters

| Name | Type |
| :------ | :------ |
| `nodeKey` | `string` |
| `options` | `AddNodeOptions` |

#### Returns

`void`

#### Defined in

methods.doc.ts:411

___

### addToSelection

▸ **addToSelection**(`items`, `opts?`): `void`

Add one or more items to the current selection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `items` | `SelectableItem`[] |
| `opts?` | `ActionExtendedOpts` |

#### Returns

`void`

#### Defined in

methods.doc.ts:150

___

### applyTransform

▸ **applyTransform**(`transition?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `transition` | `number` \| `boolean` | `false` |

#### Returns

`void`

#### Defined in

methods.doc.ts:836

___

### bringToTop

▸ **bringToTop**(`nodes`): `void`

Bring one or more nodes to the front layer.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nodes` | `Node`[] | Array of Node items. |

#### Returns

`void`

#### Defined in

methods.doc.ts:183

___

### clear

▸ **clear**(`opts?`): `void`

Clear the graph completely.

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | `ActionExtendedOpts` |

#### Returns

`void`

#### Defined in

methods.doc.ts:641

___

### closeContextMenu

▸ **closeContextMenu**(`opts?`): `void`

Manually close the context menu.

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | `Object` |
| `opts.suppressEvent` | `boolean` |

#### Returns

`void`

#### Defined in

methods.doc.ts:628

___

### eventInGraph

▸ **eventInGraph**(`e`): `boolean`

Checks whether the given event target (if there is one) is within this graph.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `e` | `Object` | The event in question |
| `e.target` | ``null`` \| `EventTarget` | - |

#### Returns

`boolean`

#### Defined in

methods.doc.ts:307

___

### getCompositeScale

▸ **getCompositeScale**(): `number`

#### Returns

`number`

#### Defined in

methods.doc.ts:48

___

### getDom

▸ **getDom**(): `FlowDom`

#### Returns

`FlowDom`

#### Defined in

methods.doc.ts:942

___

### getEdges

▸ **getEdges**(): `Map`\<`unknown`, `unknown`\>

#### Returns

`Map`\<`unknown`, `unknown`\>

#### Defined in

methods.doc.ts:944

___

### getItem

▸ **getItem**(`type?`, `key?`): `undefined` \| `FlowItem`

Retrieve an existing item by `type` and `key`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type?` | ``null`` \| `string` | The item type, one of `graph`, `node`, `edge`, or `link`. |
| `key?` | ``null`` \| `string` | The item key |

#### Returns

`undefined` \| `FlowItem`

#### Defined in

methods.doc.ts:287

___

### getLinks

▸ **getLinks**(): `Map`\<`unknown`, `unknown`\>

#### Returns

`Map`\<`unknown`, `unknown`\>

#### Defined in

methods.doc.ts:945

___

### getModel

▸ **getModel**(): `Model`

Retrieves the current model which can be used to reset to a previous state
using setModel()

#### Returns

`Model`

#### Defined in

methods.doc.ts:657

___

### getNodes

▸ **getNodes**(): `Map`\<`unknown`, `unknown`\>

#### Returns

`Map`\<`unknown`, `unknown`\>

#### Defined in

methods.doc.ts:943

___

### getState

▸ **getState**(): `FlowState`

#### Returns

`FlowState`

#### Defined in

methods.doc.ts:55

___

### isLinkValid

▸ **isLinkValid**(`fromEdge`, `toEdge`): `boolean`

Given two edges, returns `true` if a link can be created between them, otherwise `false`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `fromEdge` | `Edge` |
| `toEdge` | `Edge` |

#### Returns

`boolean`

#### Defined in

methods.doc.ts:592

___

### isSelected

▸ **isSelected**(`item`): `any`

Returns true if the given selectable item is currently selected.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `string` \| `SelectableItem` |

#### Returns

`any`

#### Defined in

methods.doc.ts:119

___

### openContextMenu

▸ **openContextMenu**(`graphX`, `graphY`, `target`, `opts?`): `void`

Open the context menu at a specific location and with a particular target.

#### Parameters

| Name | Type |
| :------ | :------ |
| `graphX` | `number` |
| `graphY` | `number` |
| `target` | `FlowItem` |
| `opts?` | `Object` |
| `opts.suppressEvent` | `boolean` |

#### Returns

`void`

#### Defined in

methods.doc.ts:612

___

### pageToContainerPos

▸ **pageToContainerPos**(`graphX`, `graphY`): `number`[]

Resolves a set of page coordinates to a position within the graph container.

#### Parameters

| Name | Type |
| :------ | :------ |
| `graphX` | `number` |
| `graphY` | `number` |

#### Returns

`number`[]

#### Defined in

methods.doc.ts:850

___

### pageToGraphPos

▸ **pageToGraphPos**(`pageX`, `pageY`): `number`[]

Resolves a set of page coordinates to a position within the graph.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pageX` | `number` | The page x position |
| `pageY` | `number` | The page y position |

#### Returns

`number`[]

#### Defined in

methods.doc.ts:862

___

### redo

▸ **redo**(): `void`

Go to the next state on the undo/redo stack. Any action performed after an "undo" will erase all redo states.

#### Returns

`void`

#### Defined in

methods.doc.ts:106

___

### removeEdge

▸ **removeEdge**(`key`, `opts?`): `void`

Remove an edge from the graph.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `opts?` | `ActionExtendedOpts` |

#### Returns

`void`

#### Defined in

methods.doc.ts:379

___

### removeFromSelection

▸ **removeFromSelection**(`keys`, `opts?`): `void`

Remove one or more items from the current selection using item keys.

#### Parameters

| Name | Type |
| :------ | :------ |
| `keys` | `string`[] |
| `opts?` | `ActionExtendedOpts` |

#### Returns

`void`

#### Defined in

methods.doc.ts:165

___

### removeItem

▸ **removeItem**(`type`, `key`, `opts?`): `void`

Remove an item from the graph

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | `FlowItemType` | The item type, one of `node`, `link`, or `edge` |
| `key` | `string` | The item key |
| `opts?` | `ActionExtendedOpts` | Extended options |

#### Returns

`void`

#### Defined in

methods.doc.ts:243

___

### removeLink

▸ **removeLink**(`key`, `opts?`): `void`

Remove a link from the graph.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `opts?` | `ActionExtendedOpts` |

#### Returns

`void`

#### Defined in

methods.doc.ts:561

___

### removeNode

▸ **removeNode**(`key`, `opts?`): `void`

Remove a node from the graph.

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `opts?` | `ActionExtendedOpts` |

#### Returns

`void`

#### Defined in

methods.doc.ts:460

___

### removeSelectedItems

▸ **removeSelectedItems**(`opts?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | `ActionExtendedOpts` |

#### Returns

`void`

#### Defined in

methods.doc.ts:261

___

### render

▸ **render**(`item`, `data?`): `void`

Call render for a particular item.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `item` | `RenderableItem` | A renderable item. Current renderable items are items of type 'node' or 'edge'. |
| `data` | `Object` | Optional data object w/ any properties to expose to your render function. |

#### Returns

`void`

#### Defined in

methods.doc.ts:779

___

### renderAll

▸ **renderAll**(`data?`): `void`

Call render on all existing renderable items.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `Object` | Optional data object w/ any properties to expose to your render function. |

#### Returns

`void`

#### Defined in

methods.doc.ts:766

___

### renderContext

▸ **renderContext**(`item`, `graphX`, `graphY`): `void`

Add render content to the context menu.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `FlowItem` |
| `graphX` | `number` |
| `graphY` | `number` |

#### Returns

`void`

#### Defined in

methods.doc.ts:819

___

### resolveItem

▸ **resolveItem**(`e`): `undefined` \| `FlowItem`

Given an event, resolves an item within the graph or returns `undefined` if no item was targeted.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `e` | `PointerEvent` \| `MouseEvent` | The event in question, either `PointerEvent` or `MouseEvent` |

#### Returns

`undefined` \| `FlowItem`

#### Defined in

methods.doc.ts:317

___

### setBackground

▸ **setBackground**(`html`): `void`

Set the background. Use the background helper to generate an SVG `grid` or `dots` background.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `html` | `string` | The html for the background |

#### Returns

`void`

#### Defined in

methods.doc.ts:952

___

### setModel

▸ **setModel**(`model`): `Promise`\<`unknown`\>

Build graph from a previous model. Optionally provide a hook which returns HTML content for 
any items with a content section. This method is asynchronous because of the way clientBoundingRect()
is calculated (not synchronously)

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | `Model` |

#### Returns

`Promise`\<`unknown`\>

#### Defined in

methods.doc.ts:706

___

### setPreselected

▸ **setPreselected**(`preselected`, `opts?`): `void`

Set which items are "preselected". Any existing "preselect" states will be removed. Preselection is the state 
before an item is selected such as when the lasso tool is hovering over an item but has not been locked in.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `preselected` | `Map`\<`string`, `SelectableItem`\> \| `SelectableItem`[] | Array or map of items to preselect. |
| `opts?` | `Pick`\<`ActionExtendedOpts`, ``"suppressEvent"``\> |  |

#### Returns

`void`

#### Defined in

methods.doc.ts:222

___

### setSelected

▸ **setSelected**(`selected`, `opts?`): `void`

Set the current selection.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `selected` | `Map`\<`string`, `SelectableItem`\> \| `SelectableItem`[] | Array or map of items to select. |
| `opts?` | `ActionExtendedOpts` |  |

#### Returns

`void`

#### Defined in

methods.doc.ts:130

___

### setView

▸ **setView**(`opts`): `void`

Translate or zoom to any coordinates within the graph.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | `SetViewOptions` | Options object |

#### Returns

`void`

#### Defined in

methods.doc.ts:881

___

### undo

▸ **undo**(): `void`

Revert to the last state on the undo stack.

#### Returns

`void`

#### Defined in

methods.doc.ts:91

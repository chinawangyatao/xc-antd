# ListPanel and ListTree

## ListPanel

Use `ListPanel<ItemType>` for a searchable selectable flat list.

```tsx
<ListPanel<Department>
  data={departments}
  defaultSelectedKey="product"
  title="部门列表"
  showAddButton
  showSearchInput
  showToolbarSelect
  toolbarSelectProps={{ options: departmentTypes }}
  onSelect={(item, selectedKey) => setSelected(selectedKey ? item : undefined)}
  contextMenu={{
    onClick: ({ key, data }) => handleItemAction(key, data),
  }}
/>
```

- Default fields: `id`, `title`, `subTitle`, `disabled`; override with `fieldNames` or `getItemKey`.
- Selection supports controlled `selectedKey` or uncontrolled `defaultSelectedKey`.
- Clicking the selected item clears it by default; set `allowDeselect={false}` to retain it.
- `showAddButton`, `showSearchInput`, and `showToolbarSelect` independently control toolbar visibility. A toolbar select renders only when `toolbarSelectProps` is provided; `searchable` remains supported for search visibility.
- Use `toolbarSelectProps` and `toolbarExtra` for custom toolbar composition.
- Default right-click keys are `edit` and `delete`.

## ListTree

Use `ListTree<NodeType>` for hierarchical navigation and search.

```tsx
<ListTree<ScenicNode>
  treeData={treeData}
  defaultExpandedKeys={['root']}
  showAddButton={false}
  showSearchInput
  showToolbarSelect
  toolbarSelectProps={{ options: nodeTypes }}
  nodeIcon={(node) => iconByType(node.type)}
  contextMenu={{
    onClick: ({ key, node }) => handleNodeAction(key, node),
  }}
  dragDrop={{
    nodeDraggable: (node) => node.key !== 'root',
    onDrop: ({ nextTreeData }) => setTreeData(nextTreeData),
  }}
/>
```

- It passes through Ant Design Tree props except wrapper-specific class/style/tree data handling.
- `horizontalScroll` defaults to `true`: the component fills its parent and horizontally scrolls when deep levels or long titles overflow. Set it to `false` to restore title truncation with a full-title Tooltip and inherited virtual scrolling; when enabled it takes precedence over `virtual`.
- `nodeIcon(node)` supplies per-node icons; an explicit `treeData[].icon` wins.
- Search preserves matching ancestor chains and auto-expands them.
- It uses the same `showAddButton`, `showSearchInput`, `showToolbarSelect`, and `toolbarSelectProps` toolbar API as `ListPanel`.
- Right-click dropdowns remain independently controlled by `contextMenu`; tree checkboxes use the inherited Ant Design `checkable` prop.
- Default right-click keys are `addChild`, `edit`, and `delete`.
- Delete confirmation is enabled for both list components. Customize `deleteConfirm` or use `false` only when the caller intentionally owns confirmation.
- `dragDrop` enables the standard three-zone drag interaction. The default upper/lower edge ratio is `0.3`; set `dropEdgeRatio` from `0` to `0.5` when a product needs a wider child or sibling target. `ListTree` prevents self/descendant cycles and passes immutable `nextTreeData` to `onDrop`.
- Use `nodeDraggable(node)` for roots and read-only nodes. Use `getDropStatus(info)` for business rules: `allowed` shows the primary indicator, `forbidden` keeps a gray rejected indicator, and `invalid` hides the indicator. Handle rejected drops with `onDropRejected` when user feedback is needed.
- All drag callbacks are optional except `onDrop`; omitting `nodeDraggable` and `getDropStatus` gives unrestricted structural dragging. Do not encode domain types, permissions, or fixed sibling priorities inside `ListTree`.
- Product switches should compose the API instead of changing the component: use `dragDrop={dragEnabled ? config : undefined}` for a drag toggle. Optional drop confirmation belongs in the caller's `onDrop`; apply `nextTreeData` only after the modal resolves successfully.
- `dragDrop` owns the high-level interaction and temporarily disables Ant Design Tree's native `draggable` path. Without `dragDrop`, inherited native Tree drag props continue to pass through unchanged.
- Mark buttons or custom controls inside `titleRender` with `data-list-tree-drag-ignore="true"` when they should be hidden from the native drag preview; standard interactive elements already do not start a node drag.
- Override `--xc-list-tree-drag-color`, `--xc-list-tree-drag-background`, and `--xc-list-tree-drag-forbidden-color` on the component root when a product theme needs different feedback colors.
- `moveListTreeNode` and `resolveListTreeDropPlacement` are exported for reducers and focused tests. Do not pass a filtered/cropped tree to `onDrop` unless replacing the hidden nodes is intentional.
- Do not pass `expandedKeys={undefined}`. Omit it for an uncontrolled tree.
- `InputTree` was removed; do not import or recreate it.

Source: `packages/xc-antd/src/ListPanel/` and `packages/xc-antd/src/ListTree/`. Live example: `apps/docs/src/pages/TreeSelectPage.tsx`.

## GroupedSelect

Use `GroupedSelect` for multi-select from labeled groups, with a searchable Select popup.

```tsx
<GroupedSelect
  groups={[{ id: 'a', label: '分组A', options: [{ value: 'a1', label: '选项A-1' }] }]}
  value={selectedValues}
  onChange={setSelectedValues}
  onAddGroup={(label) => createGroup(label)}
  onAddOption={(label, group) => createOption(label, group.id)}
  onEditOption={(option, group, label) => updateOption(option.value, group.id, label)}
/>
```

- `value`/`onChange` or `defaultValue` control selected option values (`string | number` arrays). Option values must be unique across groups.
- Search matches group or option labels. `onAddGroup(label)` and `onAddOption(label, group)` are called after in-popup input and confirmation.
- Use `groupLabelMaxLength` and `optionLabelMaxLength` to set different limits for group and option name inputs during creation and editing. Omit either prop to leave that input unrestricted.
- `onEditGroup(group, label)` and `onEditOption(option, group, label)` receive the updated name from an inline editor; async failures keep that row editable. The Select popup stays open during edits.
- Deletion uses Ant Design `Popconfirm` inside the Select popup by default; use `deleteConfirm={false}` only when the caller owns confirmation. Missing action callbacks hide their buttons.
- The caller updates `groups` after CRUD; successful deletion removes affected selected values via `onChange`.
- For remote search, pass `searchMode="remote"`, `onSearchChange={setKeyword}`, server response groups, and `searchLoading`. The component skips local filtering; the caller debounces requests and discards stale responses. On closing a nonempty search it emits `onSearchChange('')` to restore the list.
- Supply `selectedOptions` for preselected values not present in initial remote results. Labels of selected options seen in previous results are cached while they remain selected.
- Remote `groups` may contain only part of a group. If deleting a group remotely, use controlled `value` and remove all of its selected values in `onDeleteGroup`; the component cannot infer off-screen options from partial search results.
- Customize the Select trigger via `selectProps`. Live interactive example: `/grouped-select`.

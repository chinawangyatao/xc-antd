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
/>
```

- It passes through Ant Design Tree props except wrapper-specific class/style/tree data handling.
- `nodeIcon(node)` supplies per-node icons; an explicit `treeData[].icon` wins.
- Search preserves matching ancestor chains and auto-expands them.
- It uses the same `showAddButton`, `showSearchInput`, `showToolbarSelect`, and `toolbarSelectProps` toolbar API as `ListPanel`.
- Right-click dropdowns remain independently controlled by `contextMenu`; tree checkboxes use the inherited Ant Design `checkable` prop.
- Default right-click keys are `addChild`, `edit`, and `delete`.
- Delete confirmation is enabled for both list components. Customize `deleteConfirm` or use `false` only when the caller intentionally owns confirmation.
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
- `onEditGroup(group, label)` and `onEditOption(option, group, label)` receive the updated name from an inline editor; async failures keep that row editable. The Select popup stays open during edits.
- Deletion uses Ant Design `Popconfirm` inside the Select popup by default; use `deleteConfirm={false}` only when the caller owns confirmation. Missing action callbacks hide their buttons.
- The caller updates `groups` after CRUD; successful deletion removes affected selected values via `onChange`.
- For remote search, pass `searchMode="remote"`, `onSearchChange={setKeyword}`, server response groups, and `searchLoading`. The component skips local filtering; the caller debounces requests and discards stale responses. On closing a nonempty search it emits `onSearchChange('')` to restore the list.
- Supply `selectedOptions` for preselected values not present in initial remote results. Labels of selected options seen in previous results are cached while they remain selected.
- Remote `groups` may contain only part of a group. If deleting a group remotely, use controlled `value` and remove all of its selected values in `onDeleteGroup`; the component cannot infer off-screen options from partial search results.
- Customize the Select trigger via `selectProps`. Live interactive example: `/grouped-select`.

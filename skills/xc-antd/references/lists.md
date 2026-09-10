# ListPanel and ListTree

## ListPanel

Use `ListPanel<ItemType>` for a searchable selectable flat list.

```tsx
<ListPanel<Department>
  data={departments}
  defaultSelectedKey="product"
  title="部门列表"
  onSelect={(item, selectedKey) => setSelected(selectedKey ? item : undefined)}
  contextMenu={{
    onClick: ({ key, data }) => handleItemAction(key, data),
  }}
/>
```

- Default fields: `id`, `title`, `subTitle`, `disabled`; override with `fieldNames` or `getItemKey`.
- Selection supports controlled `selectedKey` or uncontrolled `defaultSelectedKey`.
- Clicking the selected item clears it by default; set `allowDeselect={false}` to retain it.
- Use `toolbarSelectProps`, `toolbarExtra`, `showAddButton`, and `onAdd` for toolbar composition.
- Default right-click keys are `edit` and `delete`.

## ListTree

Use `ListTree<NodeType>` for hierarchical navigation and search.

```tsx
<ListTree<ScenicNode>
  treeData={treeData}
  defaultExpandedKeys={['root']}
  nodeIcon={(node) => iconByType(node.type)}
  contextMenu={{
    onClick: ({ key, node }) => handleNodeAction(key, node),
  }}
/>
```

- It passes through Ant Design Tree props except wrapper-specific class/style/tree data handling.
- `nodeIcon(node)` supplies per-node icons; an explicit `treeData[].icon` wins.
- Search preserves matching ancestor chains and auto-expands them.
- Default right-click keys are `addChild`, `edit`, and `delete`.
- Delete confirmation is enabled for both list components. Customize `deleteConfirm` or use `false` only when the caller intentionally owns confirmation.
- Do not pass `expandedKeys={undefined}`. Omit it for an uncontrolled tree.
- `InputTree` was removed; do not import or recreate it.

Source: `packages/xc-antd/src/ListPanel/` and `packages/xc-antd/src/ListTree/`. Live example: `apps/docs/src/pages/TreeSelectPage.tsx`.

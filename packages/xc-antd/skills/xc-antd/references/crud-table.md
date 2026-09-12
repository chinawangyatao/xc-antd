# CrudTable

Use `CrudTable<RecordType, Query>` when data comes from a request workflow and columns should drive both query and display.

## Source and example

- Types: `packages/xc-antd/src/CrudTable/types.ts`
- Implementation: `packages/xc-antd/src/CrudTable/CrudTable.tsx`
- Example: `apps/docs/src/pages/CrudTableDemo.tsx`

## Minimal pattern

```tsx
const actionRef = useRef<CrudTableAction<User, UserQuery>>(null);

<CrudTable<User, UserQuery>
  actionRef={actionRef}
  rowKey="id"
  columns={columns}
  request={async (params, sorter, filters) => ({
    data: await queryUsers(params, sorter, filters),
    total: 100,
    success: true,
  })}
  rowSelection
  rowActions={(record) => <Button onClick={() => edit(record)}>编辑</Button>}
/>
```

## Decisions that matter

- `request` receives `current` and `pageSize` merged with typed query fields. Return `data`, optional `total`, and optional `success`.
- Without `request`, `dataSource` uses local filtering.
- `valueType`, `valueEnum`, `fieldProps`, and `formItemProps` drive rendering and query controls.
- Use `hideInSearch` and `hideInTable` for placement; use `search.transform` for ranges or renamed request parameters.
- Use `valueType: 'option'` for a manually defined action column, or provide `rowActions` and allow the component to append one.
- Put raw Ant Design table overrides in `tableProps`.
- Use `columnsState` for controlled/default/persisted visibility and order.
- Use `actionRef` for reload/reset/selection/form access. Preserve the existing method spelling `reloadAndRest`.
- `rowClickSelection` ignores clicks originating from interactive controls.

Do not use `HocTable` for server request pagination or schema-generated query forms.

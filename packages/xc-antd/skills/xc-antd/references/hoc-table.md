# HocTable

Use `HocTable<RecordType>` for local rows with global search, column filters, column settings, density controls, and inline new-row editing.

## Source and example

- Types: `packages/xc-antd/src/HocTable/types.ts`
- Implementation: `packages/xc-antd/src/HocTable/HocTable.tsx`
- Example: `apps/docs/src/pages/Table.tsx`

```tsx
<HocTable<Voucher>
  rowKey="id"
  columns={columns}
  dataSource={rows}
  newRowFactory={() => ({ status: 'enabled' })}
  newRowFieldConfig={{
    createdAt: { valueType: 'date' },
    status: {
      valueType: 'select',
      valueEnum: { enabled: { text: '启用' } },
    },
  }}
  validationRules={[{ field: 'createdAt', label: '创建日期' }]}
  onSave={saveRows}
  actionRender={({ record }) => <RowActions record={record} />}
/>
```

## Column and editing rules

- Use `HocTableColumn<RecordType>`, with stable string `key`, typed `dataIndex`, and string `title`.
- `filterable` enables a column filter; `filterMode` is `input`, `select`, `date`, or `switch`.
- Use `filterOptions` for select filters and `switchValue` for switch filters.
- New rows are owned internally until `onSave` completes. The callback receives one row for row save or multiple rows for save-all.
- Configure editable fields by `dataIndex` in `newRowFieldConfig`; `readonly` is useful for server-generated IDs.
- Validation rules run on the changed field during editing and on the full row before saving.
- Date and dateTime editor values are normalized to formatted strings before `onSave`.
- Use `tableProps` for pagination, scrolling, loading, locale, and other Ant Design table options.
- Use `options={false}` or individual `options` flags to hide search/filter/settings/density tools.

`SimpleTable`, `XcColumnDef`, and old related types are compatibility aliases only. `CRUDTable` points to `CrudTable`; use that canonical name in new code.

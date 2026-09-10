# Forms

## SchemaForm

Use `SchemaForm<Values, SubmitValues>` for typed schema-driven forms.

Source:

- `packages/xc-antd/src/SchemaForm/types.ts`
- `packages/xc-antd/src/SchemaForm/SchemaForm.tsx`
- `apps/docs/src/pages/SchemaFormDemo.tsx`

```tsx
const schema: SchemaFormGroup<FormValues, SubmitValues>[] = [
  {
    key: 'base',
    title: '基础信息',
    fields: [
      { name: 'name', label: '名称', valueType: 'text', required: true },
      {
        name: 'status',
        label: '状态',
        valueType: 'select',
        valueEnum: statusEnum,
      },
    ],
  },
];

<SchemaForm<FormValues, SubmitValues>
  schema={schema}
  mode="edit"
  initialValues={initialValues}
  onFinish={save}
/>
```

Important behavior:

- `hidden`, `disabled`, and `readonly` accept booleans or functions of current values.
- Declare `dependencies` when a field state or renderer depends on another field.
- Use `transform` to convert one UI value into submit fields, especially date ranges.
- Use `renderFormItem` only when `valueType` and `fieldProps` cannot express the control.
- Use `actionRef` for external validate/reset/get/set/submit operations.
- Set `submitter={false}` when actions are owned by a surrounding overlay.

## FormGroup

Use `FormGroup` to organize hand-written Ant Design form content. It renders a semantic section and an Ant Design `Row`; provide `Col` children.

```tsx
<FormGroup title="基础信息" extra={<Button type="link">编辑说明</Button>}>
  <Col xs={24} md={12}>
    <Form.Item name="name" label="名称">
      <Input />
    </Form.Item>
  </Col>
</FormGroup>
```

Source: `packages/xc-antd/src/FormGroup/FormGroup.tsx`; example: `apps/docs/src/pages/FormGroupDemo.tsx`.

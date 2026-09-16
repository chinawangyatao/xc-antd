# TextField

Use `TextField` when one value needs consistent read/edit rendering selected by `valueType`.

## Source and example

- Public types: `packages/xc-antd/src/TextField/field/types.ts`
- Value-type union: `packages/xc-antd/src/TextField/utils/typing.ts`
- Live example: `apps/docs/src/pages/ProFieldDemo.tsx`

## Core pattern

```tsx
import { TextField } from 'xc-antd';

<TextField
  mode="edit"
  valueType="select"
  value={status}
  valueEnum={{
    enabled: { text: '启用', status: 'Success' },
    disabled: { text: '停用', status: 'Default' },
  }}
  onChange={setStatus}
/>
```

Use `text` for read-oriented values and `value` for controlled edit values. Check the actual field implementation when `onChange` shape matters:

- Text inputs commonly emit an event.
- Select, switch, number, and rate fields commonly emit a value.
- Date/time fields emit Dayjs-compatible values and formatted arguments from Ant Design.
- Range fields may emit arrays.

Do not assume all `valueType` values have the same callback signature.

## Selection rules

- Use `valueEnum` for stable enum labels/status/color.
- Use `request` and `params` for async option sources supported by select-like fields.
- Put Ant Design control props in `fieldProps`.
- Use `mode="read"`, `mode="edit"`, or `mode="update"`; do not recreate separate read and edit components in business code.
- Read `TextFieldValueTypePropsMap` before adding type-specific props.

For full forms, route to `SchemaForm` instead of manually coordinating many `TextField` instances.

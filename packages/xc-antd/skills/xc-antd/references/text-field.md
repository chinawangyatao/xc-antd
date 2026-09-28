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
- Date/time range pickers emit a pair of formatted strings as the second `onChange` argument when selected; guard for an empty value when cleared.

Do not assume all `valueType` values have the same callback signature.

## Minimum and maximum numbers

Use `valueType="digitRange"` for a minimum and maximum entered with two Ant Design `InputNumber` controls. Keep a two-element array for controlled editing; each position may be `undefined` while that input is empty.

```tsx
import { useState } from 'react';
import { TextField } from 'xc-antd';

type Bounds = [number | undefined, number | undefined];

function PriceBounds() {
  const [bounds, setBounds] = useState<Bounds>([10, 99]);

  return (
    <>
      <TextField
        valueType="digitRange"
        mode="edit"
        value={bounds}
        onChange={(next?: Bounds) =>
          setBounds(next ? [next[0], next[1]] : [undefined, undefined])
        }
        fieldProps={{ placeholder: ['最小值', '最大值'] }}
      />
      <TextField valueType="digitRange" mode="read" text={bounds} />
    </>
  );
}
```

`onChange` emits the updated pair when either input changes. When both inputs are cleared and focus leaves the group, it may emit `undefined`; normalizing that to an empty pair keeps the editor controlled. If both numbers are present in reverse order, the component swaps them on blur and emits the sorted pair. Read mode displays `-` for an empty pair (and for `null` or `undefined`) instead of rendering `NaN`.

## Time range

Use `valueType="timeRange"` for a time of day interval. Edit mode renders Ant Design `TimePicker.RangePicker`; read mode displays the two times separated by ` ~ `.

```tsx
import { useState } from 'react';
import { TextField } from 'xc-antd';

function WorkingHours() {
  const [hours, setHours] = useState<[string, string] | null>([
    '09:00',
    '18:00',
  ]);

  return (
    <>
      <TextField
        valueType="timeRange"
        mode="edit"
        format="HH:mm"
        value={hours}
        onChange={(_times: unknown, strings?: [string, string] | null) =>
          setHours(strings?.[0] && strings?.[1] ? [strings[0], strings[1]] : null)
        }
        fieldProps={{ allowClear: true }}
      />
      <TextField valueType="timeRange" mode="read" format="HH:mm" text={hours ?? []} />
    </>
  );
}
```

The default format is `HH:mm:ss`. Set `format` on `TextField` or `fieldProps.format`; `fieldProps.format` takes precedence. Controlled `value` accepts a pair of strings in that format or Dayjs-compatible values. For an uncontrolled editor, `text` or `fieldProps.defaultValue` supplies the initial pair. `onChange` forwards Ant Design's selected Dayjs pair and formatted string pair. On clear, both arguments may be `null`; guard the formatted pair before reading it and store `null` or another empty value. Put other `TimePicker.RangePicker` options, such as `disabled` and `allowClear`, in `fieldProps`.

## Selection rules

- Use `valueEnum` for stable enum labels/status/color.
- Use `request` and `params` for async option sources supported by select-like fields.
- Put Ant Design control props in `fieldProps`.
- Use `mode="read"`, `mode="edit"`, or `mode="update"`; do not recreate separate read and edit components in business code.
- Read `TextFieldValueTypePropsMap` before adding type-specific props.

For full forms, route to `SchemaForm` instead of manually coordinating many `TextField` instances.

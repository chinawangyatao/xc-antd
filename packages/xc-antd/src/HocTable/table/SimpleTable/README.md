# SimpleTable 通用表格组件

一个开箱即用的 **声明式表格组件**，整合了表头工具栏、列筛选、全局搜索、列显隐与排序、行内新增编辑、表单校验、保存回调等能力。

> 业务侧只需声明 `columns` 与 `dataSource`，其余功能通过可选 props 启用。

---

## 特性

- ✅ 列级筛选（input 模糊 / select 精确）
- ✅ 全局搜索（命中即过滤 + 关键词高亮）
- ✅ 表头工具栏：搜索 / 筛选开关 / 列设置 / 表格密度
- ✅ 列显隐与拖拽排序
- ✅ 行内新增编辑（`TextField` 渲染 input / select / date 等）
- ✅ 实时 + 保存时表单校验（错误红框 + 错误文案）
- ✅ 操作列可自定义（默认提供「编辑 / 删除」）
- ✅ 完整泛型 `<T>` 类型推导

---

## 快速开始

```tsx
import {
  SimpleTable,
  simpleTableDemoData,
  type XcColumnDef,
} from '@xc-antd/ui';

interface User {
  id: string;
  name: string;
  age: number;
  status: string;
}

const columns: XcColumnDef<User>[] = [
  { key: 'name', title: '姓名', dataIndex: 'name', filterable: true },
  { key: 'age', title: '年龄', dataIndex: 'age' },
  {
    key: 'status', title: '状态', dataIndex: 'status',
    filterable: true, filterMode: 'select',
    filterOptions: [
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' },
    ],
  },
];

const data: User[] = [/* ... */];

export default () => (
  <SimpleTable<User>
    columns={columns}
    dataSource={data}
    onSave={(rows) => console.log('保存', rows)}
  />
);
```

---

## API

### `SimpleTableProps<T>`

| 参数                | 类型                                                       | 默认值        | 必填 | 说明                                                              |
| ------------------- | ---------------------------------------------------------- | ------------- | ---- | ----------------------------------------------------------------- |
| `columns`           | `XcColumnDef<T>[]`                                         | -             | ✅   | 列定义（不含操作列）                                              |
| `dataSource`        | `T[]`                                                      | -             | ✅   | 数据源                                                            |
| `rowKey`            | `keyof T & string`                                         | `'id'`        |      | 行主键字段                                                        |
| `enableAdd`         | `boolean`                                                  | `true`        |      | 是否启用「添加」按钮 + 行内编辑                                   |
| `newRowFactory`     | `() => Partial<T>`                                         | -             |      | 新增空行默认值工厂（除主键外）                                    |
| `newRowFieldConfig` | `Record<string, NewRowFieldConfig>`                        | `{}`          |      | 新增行字段编辑配置，按 `dataIndex` 索引                           |
| `validationRules`   | `SimpleTableValidationRule[]`                              | `[]`          |      | 校验规则，仅作用于新增行                                          |
| `onSave`            | `(rows: T[]) => void \| Promise<void>`                     | console.log   |      | 校验通过后的保存回调                                              |
| `actionRender`      | `(ctx: ActionRenderContext<T>) => ReactNode`               | 默认「编辑/删除」 |      | 自定义已有行的操作列                                              |
| `actionTitle`       | `string`                                                   | `'操作'`      |      | 操作列标题                                                        |
| `showAction`        | `boolean`                                                  | `true`        |      | 是否展示操作列                                                    |

### `XcColumnDef<T>`

| 字段            | 类型                                | 说明                                  |
| --------------- | ----------------------------------- | ------------------------------------- |
| `key`           | `string`                            | 唯一 key（列设置使用）                |
| `title`         | `string`                            | 列标题                                |
| `dataIndex`     | `keyof T & string`                  | 数据字段名                            |
| `filterable`    | `boolean`                           | 是否启用列级筛选 + 关键词高亮         |
| `filterMode`    | `'input' \| 'select'`               | 筛选模式，默认 `'input'`              |
| `filterOptions` | `{ label; value }[]`                | select 模式下的选项                   |
| `render`        | `(text, record, index) => ReactNode`| 已有行的自定义渲染                    |

### `NewRowFieldConfig`

| 字段          | 类型                                     | 说明                                          |
| ------------- | ---------------------------------------- | --------------------------------------------- |
| `valueType`   | `'text' \| 'select' \| 'date' \| string` | TextField 的值类型                            |
| `placeholder` | `string`                                 | 占位文字                                      |
| `valueEnum`   | `Record<string, { text: string }>`       | `valueType='select'` 时的枚举映射             |
| `readonly`    | `boolean`                                | 新增行直接展示 placeholder，不渲染输入框      |

### `SimpleTableValidationRule`

| 字段     | 类型                                       | 说明                                                    |
| -------- | ------------------------------------------ | ------------------------------------------------------- |
| `field`  | `string`                                   | 字段名（对应列 dataIndex）                              |
| `label`  | `string`                                   | 字段中文名，用于默认错误提示                            |
| `rule`   | `(value: string) => string \| null`        | 自定义校验函数；不传则视为必填，空值时报 `${label}不能为空` |

### `ActionRenderContext<T>`

| 字段           | 类型           | 说明                       |
| -------------- | -------------- | -------------------------- |
| `record`       | `T`            | 当前行数据                 |
| `isNewRow`     | `boolean`      | 是否为新增的临时行         |
| `removeNewRow` | `() => void`   | 移除该行（仅新增行有意义） |

---

## 完整示例

```tsx
import {
  SimpleTable,
  simpleTableDemoData,
  type XcColumnDef,
  type NewRowFieldConfig,
  type SimpleTableValidationRule,
} from '@xc-antd/ui';
import { Button, Space } from 'antd';

interface DataType {
  id: string;
  passBeginTime: string;
  productName: string;
  contactMobile: string;
  // ...
}

const columns: XcColumnDef<DataType>[] = [
  { key: 'passBeginTime', title: '凭证创建时间', dataIndex: 'passBeginTime', filterable: true },
  { key: 'id', title: '凭证编码', dataIndex: 'id', filterable: true },
  {
    key: 'productName', title: '凭证名称', dataIndex: 'productName',
    filterable: true, filterMode: 'select',
    filterOptions: [
      { label: '联票', value: '巨峰游览区成人联票' },
    ],
  },
  { key: 'contactMobile', title: '手机号', dataIndex: 'contactMobile', filterable: true },
];

const newRowFieldConfig: Record<string, NewRowFieldConfig> = {
  passBeginTime: { valueType: 'date', placeholder: '选择日期' },
  id: { valueType: 'text', placeholder: '自动生成', readonly: true },
  productName: {
    valueType: 'select', placeholder: '选择凭证名称',
    valueEnum: { '巨峰游览区成人联票': { text: '巨峰游览区成人联票' } },
  },
  contactMobile: { valueType: 'text', placeholder: '请输入手机号' },
};

const validationRules: SimpleTableValidationRule[] = [
  { field: 'passBeginTime', label: '凭证创建时间' },
  { field: 'productName', label: '凭证名称' },
  {
    field: 'contactMobile', label: '手机号',
    rule: (v) => {
      if (!v) return '请输入手机号';
      if (!/^1[3-9]\d{9}$/.test(v)) return '手机号格式不正确';
      return null;
    },
  },
];

export default () => (
  <SimpleTable<DataType>
    columns={columns}
    dataSource={simpleTableDemoData as DataType[]}
    newRowFieldConfig={newRowFieldConfig}
    validationRules={validationRules}
    newRowFactory={() => ({
      passBeginTime: '',
      productName: '',
      contactMobile: '',
    })}
    onSave={(rows) => console.log('保存', rows)}
    actionRender={({ record }) => (
      <Space>
        <Button type="primary" size="small">编辑</Button>
        <Button size="small" danger>删除</Button>
      </Space>
    )}
  />
);
```

---

## 高级用法

### 1. 关闭新增功能

```tsx
<SimpleTable enableAdd={false} columns={cols} dataSource={data} />
```

工具栏左上角的「添加」按钮会被隐藏，组件退化为只读表格。

### 2. 隐藏操作列

```tsx
<SimpleTable showAction={false} columns={cols} dataSource={data} />
```

### 3. 自定义已有行操作列

```tsx
<SimpleTable
  columns={cols}
  dataSource={data}
  actionRender={({ record }) => (
    <Button onClick={() => handleEdit(record)}>编辑</Button>
  )}
/>
```

> 注意：新增行的操作列固定为「删除」按钮，由组件内部管理，不受 `actionRender` 影响。

### 4. 自定义主键字段

```tsx
interface Product { code: string; name: string; }

<SimpleTable<Product>
  rowKey="code"
  columns={cols}
  dataSource={products}
/>
```

### 5. 异步保存

```tsx
<SimpleTable
  columns={cols}
  dataSource={data}
  onSave={async (rows) => {
    await api.batchCreate(rows);
    message.success('保存成功');
    refresh();
  }}
/>
```

`onSave` 返回 Promise 时，组件会 await 完成后再清空新增行。

---

## 校验机制

1. **实时校验**：用户在新增行的任意字段输入时，立即对该字段执行规则，错误信息会动态显示在输入框下方，输入框边框转红。
2. **保存时校验**：点击底部「保存」按钮时对所有新增行的所有规则做一次完整校验，存在错误则不会触发 `onSave`，错误统一展示。
3. **校验作用范围**：仅作用于新增行（`id` 以 `__new_` 开头），已有数据行不受影响。
4. **规则形态**：
   - 不提供 `rule` 函数：视为必填，空值时报 `${label}不能为空`
   - 提供 `rule` 函数：返回错误字符串表示校验失败，返回 `null` 表示通过

---

## FAQ

**Q：如何获取当前新增的行数据？**
A：通过 `onSave(rows)` 回调获取，校验通过后才会触发。

**Q：可以让新增行的字段也支持复杂的自定义渲染吗？**
A：目前新增行的渲染由 `newRowFieldConfig` 统一管理 `valueType`。如果需要完全自定义，建议自己维护 newRows 状态并通过 `columns[].render` 区分新增行。后续可以考虑扩展 `newRowFieldConfig.render` 字段。

**Q：保存后如何让数据加入到列表里？**
A：在 `onSave` 中把数据拼接到外部 `dataSource` 状态，或者重新请求列表数据。组件本身只负责新增编辑与校验，不维护已有数据。

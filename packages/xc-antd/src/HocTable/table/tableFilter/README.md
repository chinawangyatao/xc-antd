# TableFilter 表头筛选组件

一个用于 antd `Table` 表头筛选区域的轻量封装组件，支持两种模式：

- **input 模糊搜索**：表头下方展开 `Input`，输入即过滤。
- **select 下拉精确筛选**：表头下方展开 `Select`，从枚举选项中精确匹配。

> 该组件是 `useXcTable` 内部使用的基础筛选单元，也支持业务自定义表格直接独立使用。

---

## 引入

```ts
// 直接引入主组件 + 子组件（推荐）
import { TableFilter } from '@zhilv/xc-antd';

// 仅引入子组件
import { TableFilterInput, TableFilterSelect } from '@zhilv/xc-antd';

// 类型
import type {
  FilterMode,
  FilterOption,
  TableFilterProps,
  TableFilterInputProps,
  TableFilterSelectProps,
} from '@zhilv/xc-antd';
```

---

## 两种使用方式

### 1. 统一入口（按 `filterMode` 切换）

```tsx
<TableFilter
  title="姓名"
  visible={filterVisible}
  filterMode="input"
  searchText={keyword}
  onSearchChange={setKeyword}
/>

<TableFilter
  title="状态"
  visible={filterVisible}
  filterMode="select"
  filterOptions={[
    { label: '启用', value: '1' },
    { label: '禁用', value: '0' },
  ]}
  selectedValue={status}
  onSelectedChange={setStatus}
/>
```

### 2. 复合子组件（语义更明确）

```tsx
<TableFilter.Input
  title="姓名"
  visible={filterVisible}
  searchText={keyword}
  onSearchChange={setKeyword}
/>

<TableFilter.Select
  title="状态"
  visible={filterVisible}
  filterOptions={options}
  selectedValue={status}
  onSelectedChange={setStatus}
/>
```

---

## 在 SimpleTable 中的使用

`SimpleTable` 通过 `useXcTable` hook 自动接入 `TableFilter`，业务侧只需在列定义中声明 `filterable / filterMode / filterOptions` 即可：

```tsx
import { SimpleTable } from '@zhilv/xc-antd';
import type { XcColumnDef } from '@zhilv/xc-antd';

const columns: XcColumnDef<DataType>[] = [
  // input 模糊搜索（默认）
  { key: 'name', title: '姓名', dataIndex: 'name', filterable: true },

  // select 下拉精确筛选
  {
    key: 'status',
    title: '状态',
    dataIndex: 'status',
    filterable: true,
    filterMode: 'select',
    filterOptions: [
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' },
    ],
  },
];

<SimpleTable />;
```

表头工具栏的「筛选」按钮控制 `filterVisible`，开启后表头下方会自动渲染 `TableFilter`；关闭则只显示标题。

---

## 在自定义表格中直接使用

如果不使用 `useXcTable`，也可在 antd `Table` 的列 `title` 中直接放置 `TableFilter`：

```tsx
const [keyword, setKeyword] = useState('');
const [visible, setVisible] = useState(true);

const columns: ColumnsType<DataType> = [
  {
    title: () => (
      <TableFilter.Input
        title="姓名"
        visible={visible}
        searchText={keyword}
        onSearchChange={setKeyword}
      />
    ),
    dataIndex: 'name',
  },
];

const filteredData = useMemo(
  () => dataSource.filter(item => item.name.includes(keyword)),
  [keyword],
);

<Table columns={columns} dataSource={filteredData} />;
```

---

## API

### `TableFilter` props（`TableFilterProps`）

| 参数              | 类型                          | 默认值                | 说明                                              |
| ----------------- | ----------------------------- | --------------------- | ------------------------------------------------- |
| `title`           | `string`                      | -                     | 列标题，必填                                      |
| `visible`         | `boolean`                     | `false`               | 是否展开筛选区域；`false` 时只渲染标题            |
| `filterMode`      | `'input' \| 'select'`         | `'input'`             | 筛选模式                                          |
| `placeholder`     | `string`                      | 自动                  | input 默认 `请输入${title}`；select 默认 `请选择${title}` |
| `searchText`      | `string`                      | -                     | input 模式：当前搜索关键词（受控）                |
| `onSearchChange`  | `(value: string) => void`     | -                     | input 模式：搜索词变更回调                        |
| `filterOptions`   | `{ label; value }[]`          | -                     | select 模式：下拉选项                             |
| `selectedValue`   | `string`                      | -                     | select 模式：当前选中值（受控）                   |
| `onSelectedChange`| `(value: string) => void`     | -                     | select 模式：选中值变更回调                       |

### `TableFilter.Input` props（`TableFilterInputProps`）

仅保留 input 模式相关字段：`title / visible / placeholder / searchText / onSearchChange`。

### `TableFilter.Select` props（`TableFilterSelectProps`）

仅保留 select 模式相关字段：`title / visible / placeholder / filterOptions / selectedValue / onSelectedChange`。

---

## 设计说明

1. **受控组件**：搜索词 / 选中值均由外部维护，便于与全局过滤状态（如 `useXcTable` 内部的 `columnFilters`）配合。
2. **`visible=false` 时退化为纯标题**：保证表头始终能展示文字，避免布局抖动。
3. **展开动画**：内置 `filterSlideIn` 关键帧动画（300ms 上滑淡入），表头筛选区显隐更顺滑。
4. **复合子组件 `TableFilter.Input / TableFilter.Select`**：在你只需要一种模式时使用，类型更窄、调用更直观。

---

## FAQ

**Q：为什么 select 模式没有 Dropdown 弹出层？**
A：早期版本曾用 `Dropdown` 包裹，但下拉选择本身就是弹出交互，再包一层 Dropdown 反而冗余，故移除。

**Q：select 模式能否多选？**
A：当前 API 只支持单选（`selectedValue: string`）。如需多选，请直接使用 antd `Select` 自行实现，或在此基础上扩展 `mode="multiple"` 与字符串数组类型。

**Q：和 `useXcTable` 是什么关系？**
A：`useXcTable` 内部消费 `TableFilter.Input / TableFilter.Select`，并自动接入 TanStack Table 的列级过滤。业务无需手动维护 `searchText / selectedValue`，只声明列即可。

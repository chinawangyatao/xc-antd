# xc-antd

React 19 + Ant Design 6 enterprise component library, published as ESM
TypeScript/TSX source.

[Online examples](https://chinawangyatao.github.io/xc-antd/)

## Install

```bash
npm install xc-antd antd @ant-design/icons react react-dom
```

## Usage

```tsx
import { CrudTable, SchemaForm, TextField } from 'xc-antd'
import 'xc-antd/style'
```

The package exports `src/index.ts` directly and does not provide a CommonJS
build. Use a modern bundler such as Vite, and configure Tailwind CSS v4 so source
utility classes can be generated:

```ts
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Main components include:

- `TextField`: unified read/edit fields driven by `valueType`
- `CrudTable`: request, search, pagination, selection and column settings
- `SchemaForm`: typed configuration-driven forms
- `FormGroup`: grouped form layout
- `ActionDrawer` and `ActionModal`: standardized action overlays
- `ImageUpload`: image upload, preview, validation and advanced cropping
- `GroupedSelect`: searchable grouped multi-select with optional editing actions
- `ListPanel` and `ListTree`: searchable list navigation with context menus; `ListTree` also provides validated three-zone drag and immutable move results
- `SensitiveData`: sensitive text/image masking with local or requested reveal
- `RichTextEditor`: React 19-compatible rich HTML editing and read-only preview
- `AmapEditor`: AMap marker, polyline, POI search and map-control workflows
- `QRCode`: SVG/Canvas QR codes with logo and business-state overlays
- `VideoPlayer` and `MusicPlayer`: XGPlayer media playback with built-in and streaming plugin configuration
- `PermissionProvider`, `PermissionGuard`, and `usePermission`: shared permission-code checks for rendering and business logic

See the repository documentation app for complete examples.

## UI 规范配置

使用原生 `ConfigProvider` 接入可选预设，不需要额外的 Provider 或全局 CSS 覆盖：

```tsx
import { ConfigProvider } from 'antd'
import { CrudTable, xcConfigProviderProps, xcTablePagination } from 'xc-antd'
import 'xc-antd/style'

<ConfigProvider {...xcConfigProviderProps}>
  <CrudTable
    columns={columns}
    dataSource={rows}
    search={{
      defaultColsNumber: 4,
      colProps: { xs: 24, sm: 12, lg: 6 },
      rowProps: { gutter: 16 },
    }}
    pagination={xcTablePagination}
  />
</ConfigProvider>
```

- `xcTheme` 是原生 `ThemeConfig`，`xcConfigProviderProps` 是可 JSON 序列化的原生配置对象，包含主题、右侧抽屉关闭按钮与禁止遮罩关闭。宿主继续通过 `getPopupContainer` / 浮层 `getContainer` 配置挂载位置。覆盖品牌时按原生 Token 语义同步配置所需色阶；仅覆盖 `colorPrimary` 不会清除已显式配置的派生颜色。
- 自定义分组、列表、树、表格与列设置浮层读取最近 `ConfigProvider` 的 Token；未接入预设时仍跟随宿主主题。表格单元格的 16px 留白、48px 选择列通过 `theme.components.Table` 设置。
- 查询按钮默认“展开 / 收起 → 查询 → 重置”。`search.actionOrder` 可恢复 `['collapse', 'reset', 'submit']`；`colProps` 使用原生栅格对象，按查询区实际内容宽度重排，`defaultColsNumber` 不再限制为 3。表单和行配置分别使用 `formProps`、`rowProps`。
- `CrudTable` 默认紧凑密度（`defaultSize="small"`），右侧工具栏仅显示自定义列。刷新、密度、全屏可通过 `options={{ reload: true, density: true, fullScreen: true }}` 启用；`options={false}` 隐藏所有内置工具。只剩一个可见列（包括仅剩操作列）时，解除该列固定并关闭默认横向滚动；恢复多列后按原配置恢复固定和滚动，显式 `tableProps.scroll` 仍优先。
- `GroupedSelect` 的下拉框、分组选择、颜色面板和删除确认气泡默认检测宿主 `#mask-layer`，存在时挂到该节点，不存在时不指定挂载容器，遵循 Ant Design 原生配置，避免强制挂在有裁切的 Select 下拉层内；显式 `selectProps.getPopupContainer` 优先。同一时间只确认一个删除目标，列表 / 页面滚动、搜索或关闭下拉框时收起；异步删除仍由原生 Popconfirm 管理 Loading 和关闭时机。
- `ActionDrawer` 和 `ImageCropDrawer` 默认使用原生 `closable.placement: 'end'`。`ActionModal` 底栏改为右对齐“取消 → 确认”，抽屉保持左对齐“确认 → 取消”；旧弹窗布局可显式指定 `footerLayout="drawer"`。主按钮不再强制 88px，未保存提示为 480px。`mask` 未传时继承宿主原生配置，传入的值优先。
- `FormGroup` 默认不叠加容器留白，可用 `style={{ padding: 'var(--xc-padding-lg)' }}` 增加规范 24px 留白。`SchemaForm` 可通过 `groupProps` 为所有组统一配置，单个组的 `groupProps` 优先；外层已有留白时不要重复设置。标签与控件间距、字段行间距使用原生 Form Token。
- `SchemaForm` 和 `CrudTable` 查询控件自动贯通 Form.Item 的 `id`、ARIA、校验事件与 ref。关联属性和表单值优先于 `fieldProps`，事件先执行业务回调，再执行表单回调；相同函数只调用一次。自定义 `renderFormItem` 使用新增的 `controlProps` 与 `ref` 接入实际控件。
- `CrudTable` 默认长文本、`HocTable` 显式设置 `column.ellipsis` 的文本使用原生 Tooltip 查看全文；自定义 `render` 继续由业务决定展示。`HocTable` 的规范分页可通过 `tableProps={{ pagination: xcTablePagination }}` 接入，固定列、表头和表体滚动继续使用原生 `columns` / `tableProps.scroll`，`CrudTable` 也可用 `adaptiveHeight`。
- 表格内部默认负责左右 24px 留白；外层已负责安全区时，可在表格 `style` 中设置 `{'--xc-table-padding-inline': '0px'}`（TypeScript 可断言为 `React.CSSProperties`）。
- 列表、树和表格共用滚动条样式：默认 10px 槽位、6→10px 滑块；在组件根节点或滚动容器添加 `className="xc-scrollbar--small"` 采用 6px 槽位、4→6px 滑块。独立容器使用 `xc-scrollbar`，小号组合为 `xc-scrollbar xc-scrollbar--small`。精确尺寸适用于 Chromium / Safari；Firefox 和系统强制覆盖滚动条时保留原生行为。

## Agent Skills

This package includes version-matched Agent Skills. After installing the package,
install the consumer skill into the current project:

```bash
npx xc-antd-skills install
```

This installs `xc-antd` plus the dedicated `xc-antd-image-upload`,
`xc-antd-rich-text-editor`, `xc-antd-amap-editor`, `xc-antd-qr-code`,
`xc-antd-media-player`, and `xc-antd-permission` Skills under `.agents/skills`. Re-run with `--force`
after upgrading the package.
Component-library maintainers can also install the authoring Skill:

```bash
npx xc-antd-skills install --all --force
```

Use `--target <directory>` to select another Agent Skills directory. Start a new
AI Agent session after installation so the new skills are discovered.

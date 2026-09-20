# XC-AntD 组件库

[在线组件示例](https://chinawangyatao.github.io/xc-antd/)

一个基于 React 19、TypeScript 6.0、Vite 8.0 和 Ant Design 6.x 的企业级组件库 monorepo 项目。

## 项目概述

XC-AntD 是一个现代化的前端组件库，采用 monorepo 架构组织代码。项目包含核心 UI 组件包和文档站点，提供了丰富的业务组件，特别是强大的表单字段组件（TextField）和高级表格组件（HocTable）。

## 技术栈

- **构建工具**: Vite 8.0 + Bun
- **框架**: React 19.2.6
- **语言**: TypeScript 6.0
- **UI 库**: Ant Design 6.4.3
- **样式**: TailwindCSS 4.3.0 + Ant Design Style
- **包管理**: Bun Workspaces
- **代码检查**: ESLint 10.3.0
- **状态请求**: SWR 2.3.0
- **路由**: React Router DOM 7.6.0
- **表格**: Ant Design Table 6.4.3

## 项目结构

```
xc-view/
├── apps/
│   └── docs/                    # 文档站点应用
│       ├── src/
│       │   ├── pages/          # 页面组件
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── package.json        # @xc-antd/docs
│       └── vite.config.ts
│
├── packages/
│   └── xc-antd/                # 核心 UI 组件库
│       ├── src/
│       │   ├── TextField/      # 表单字段组件库
│       │   │   ├── field/      # 各种字段类型组件
│       │   │   ├── provider/   # Context Provider
│       │   │   └── utils/      # 工具函数和 hooks
│       │   ├── HocTable/       # 高级表格组件
│       │   │   ├── HocTable.tsx
│       │   │   ├── types.ts
│       │   │   ├── utils.ts
│       │   │   └── style.css
│       │   ├── index.ts
│       │   └── index.css
│       ├── package.json        # xc-antd
│       └── vite.config.ts
│
├── package.json                # 根配置
├── tsconfig.json               # TypeScript Project References
└── eslint.config.js
```

## 核心功能

### 1. TextField 字段组件库

提供统一的字段渲染和编辑组件，支持多种字段类型：

**基础字段**
- Text - 文本
- TextArea - 多行文本
- Password - 密码
- Digit - 数字
- Money - 金额
- Percent - 百分比

**选择器**
- Select - 下拉选择
- Radio - 单选框
- Checkbox - 复选框
- Cascader - 级联选择
- TreeSelect - 树选择
- Segmented - 分段控制器

**日期时间**
- DatePicker - 日期选择
- RangePicker - 日期范围
- TimePicker - 时间选择
- FromNow - 相对时间
- Second - 秒数

**其他组件**
- Switch - 开关
- Slider - 滑块
- Rate - 评分
- Progress - 进度条
- Image - 图片
- ColorPicker - 颜色选择器
- Code - 代码编辑器
- Status - 状态展示
- IndexColumn - 索引列

### 2. HocTable 高级表格组件

基于 Ant Design Table 的本地数据与行内新增表格，提供：

- 全局搜索与 input / select / date / switch 列级筛选
- 列显隐、拖拽排序与表格密度设置
- 行内新增、实时校验、单行或批量保存
- `SimpleTable` 作为旧 API 的兼容别名

请求分页、查询表单与完整 CRUD 工作流由 `CrudTable` 负责。

### AI Agent Skills

仓库在 `packages/xc-antd/skills/` 维护与 npm 包版本一致的 Agent Skills，`.agents/skills` 指向该目录：

- `xc-antd` - 帮助 AI 选择并正确使用组件。
- `xc-antd-image-upload` - 专门处理 ImageUpload、图片裁剪、Canvas 输出与上传问题。
- `xc-antd-rich-text-editor` - 专门处理富文本编辑、Quill 配置、只读预览、SSR 与 HTML 安全边界。
- `xc-antd-amap-editor` - 专门处理高德地图打点、路径绘制、搜索、凭证和 SSR 问题。
- `xc-antd-qr-code` - 专门处理 SVG/Canvas 二维码、Logo、纠错等级与业务状态。
- `xc-antd-component-authoring` - 约束组件库目录、API、样式、兼容与测试方式。

新的 AI Agent 会话可自动发现这些 Skills。详细组件资料位于各 Skill 的 `references/` 中，按任务需要加载。

使用方安装 npm 包后，在其项目根目录执行 `npx xc-antd-skills install`
即可安装使用 Skill；升级包后使用 `--force` 同步新版本。

## 快速开始

### 环境要求

- Node.js >= 18
- Bun >= 1.0

### 安装依赖

```bash
bun install
```

### 开发模式

启动文档站点开发服务器：

```bash
bun run dev
```

### 构建

构建 UI 组件库：

```bash
bun run build
```

构建文档站点：

```bash
bun run build:docs
```

### 预览文档

```bash
bun run preview
```

### 代码检查

```bash
bun run lint
```

## 使用方式

### 安装组件库

```bash
bun add xc-antd
```

### 引入组件

```tsx
import { ProField, HocTable } from 'xc-antd';
import 'xc-antd/style';

// 使用字段组件
<ProField value="Hello" valueType="text" />

// 使用表格组件
<HocTable columns={columns} dataSource={data} />
```

## 开发指南

### 添加新组件

1. 在 `packages/xc-antd/src/` 下创建组件目录
2. 编写组件代码和类型定义
3. 在 `index.ts` 中导出组件
4. 在 `apps/docs/src/pages/` 添加文档示例

### 组件开发规范

- 使用 TypeScript 编写，提供完整的类型定义
- 支持编辑模式和只读模式
- 遵循 Ant Design 设计规范
- 使用 TailwindCSS 编写样式
- 提供完整的 Props 类型文档

## Monorepo 架构

项目使用 Bun Workspaces 管理多包：

```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

### 包说明

- **xc-antd** - 核心组件库，可独立发布
- **@xc-antd/docs** - 文档站点应用

### TypeScript Project References

使用 TypeScript Project References 优化构建：

```json
{
  "references": [
    { "path": "./packages/xc-antd/tsconfig.json" },
    { "path": "./apps/docs/tsconfig.json" }
  ]
}
```

## 发布与构建

`xc-antd` 以 ESM TypeScript/TSX 源码发布，包入口为
`src/index.ts`，使用方由 Vite 等现代构建器编译。发布前执行测试和
TypeScript 类型检查，不发布 `dist/` 或 CommonJS 产物。

Vite Library 模式仅用于仓库内部的浏览器打包验证。

### ESLint 配置

使用 ESLint Flat Config 格式，支持：

- TypeScript 类型检查
- React Hooks 规则
- React Refresh 规则

## 特性

- ✅ **现代化技术栈** - React 19 + TypeScript 6 + Vite 8
- ✅ **Monorepo 架构** - 清晰的代码组织和依赖管理
- ✅ **丰富的组件** - 30+ 业务组件覆盖常见场景
- ✅ **类型安全** - 完整的 TypeScript 类型定义
- ✅ **高性能构建** - Vite + Bun 极速开发和构建
- ✅ **文档完善** - 独立的文档站点
- ✅ **样式灵活** - TailwindCSS + Ant Design Style
- ✅ **按需加载** - 支持 Tree Shaking

## 许可证

MIT

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件

---

**XC-AntD** - 让开发更高效，让组件更优雅。

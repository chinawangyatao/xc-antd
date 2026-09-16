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
- `SensitiveData`: sensitive text/image masking with local or requested reveal

See the repository documentation app for complete examples.

## Agent Skills

This package includes version-matched Agent Skills. After installing the package,
install the consumer skill into the current project:

```bash
npx xc-antd-skills install
```

This installs `xc-antd` and the dedicated `xc-antd-image-upload` Skill under
`.agents/skills`. Re-run with `--force` after upgrading the package.
Component-library maintainers can also install the authoring Skill:

```bash
npx xc-antd-skills install --all --force
```

Use `--target <directory>` to select another Agent Skills directory. Start a new
AI Agent session after installation so the new skills are discovered.

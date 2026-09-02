# @zhilv/xc-antd

React 19 + Ant Design 6 enterprise component library.

## Install

```bash
npm install @zhilv/xc-antd antd @ant-design/icons react react-dom \
  --registry http://repo.zhihuiwenlvyun.com/repository/npm-hosted/
```

## Usage

```tsx
import { CrudTable, SchemaForm, TextField } from '@zhilv/xc-antd'
import '@zhilv/xc-antd/style'
```

Main components include:

- `TextField`: unified read/edit fields driven by `valueType`
- `CrudTable`: request, search, pagination, selection and column settings
- `SchemaForm`: typed configuration-driven forms
- `FormGroup`: grouped form layout
- `ActionDrawer` and `ActionModal`: standardized action overlays

See the repository documentation app for complete examples.

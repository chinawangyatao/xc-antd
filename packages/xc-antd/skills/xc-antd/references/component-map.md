# Component map

Choose one primary component family before coding.

| Need | Use | Boundary |
| --- | --- | --- |
| Render or edit one typed value | `TextField` | It is an atomic field, not a form state manager. |
| Generate a form from typed configuration | `SchemaForm` | Use for schema, dependencies, transforms, and submit actions. |
| Visually group hand-written form fields | `FormGroup` | It supplies a section and Ant Design `Row`; callers supply `Col` children. |
| Remote request, query form, pagination, selection, actions | `CrudTable` | The request callback owns server filtering and paging. |
| Local rows, global/column filtering, inline new rows | `HocTable` | It does not provide the `CrudTable` request/query workflow. |
| Searchable flat navigation list | `ListPanel` | Default data fields are `id`, `title`, `subTitle`, `disabled`. |
| Searchable hierarchy | `ListTree` | Flat `treeData` also works, but use `ListPanel` for list subtitles and disabled list styling. |
| Upload, validate, preview, or crop images | `ImageUpload` | Use `ImageCropDrawer` directly only when upload is owned elsewhere. |
| Async-confirming drawer | `ActionDrawer` | Controlled through `open` and `onOpenChange`. |
| Async-confirming modal | `ActionModal` | Same action contract as `ActionDrawer`. |

## Current public sources

- Fields: `packages/xc-antd/src/TextField/field/`
- Forms: `packages/xc-antd/src/SchemaForm/`, `packages/xc-antd/src/FormGroup/`
- Tables: `packages/xc-antd/src/CrudTable/`, `packages/xc-antd/src/HocTable/`
- Lists: `packages/xc-antd/src/ListPanel/`, `packages/xc-antd/src/ListTree/`
- Media: `packages/xc-antd/src/ImageUpload/`
- Overlays: `packages/xc-antd/src/ActionOverlay/`
- Public barrel: `packages/xc-antd/src/index.ts`

## Example routes

- TextField: `/pro-field`
- HocTable: `/table`
- CrudTable: `/crud-table`
- SchemaForm: `/schema-form`
- FormGroup: `/form-group`
- Lists: `/tree-select`
- Image upload: `/image-upload`
- Overlays: `/action-overlay`

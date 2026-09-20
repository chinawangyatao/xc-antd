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
| Searchable or draggable hierarchy | `ListTree` | `dragDrop` adds generic three-zone movement; keep domain hierarchy and ordering rules in caller callbacks. |
| Grouped multi-select with search and editable options | `GroupedSelect` | Use for choosing labels from groups; groups and CRUD callbacks are owned by the caller. |
| Mask sensitive text or images and reveal on demand | `SensitiveData` | Use `request` mode when plaintext must not be present in the initial frontend payload. |
| Upload, validate, preview, or crop images | `ImageUpload` | Use `ImageCropDrawer` directly only when upload is owned elsewhere. |
| Edit or preview HTML rich content | `RichTextEditor` | It owns the editor surface; callers own HTML persistence and sanitization at the trust boundary. |
| Edit AMap markers and paths | `AmapEditor` | Persist coordinate tuples; the component owns AMap overlay instances and drawing interaction. |
| Render SVG or Canvas QR codes | `QRCode` | Use visual statuses for loading/expiry/scanned flows; encoded content remains caller-owned. |
| Async-confirming drawer | `ActionDrawer` | Controlled through `open` and `onOpenChange`. |
| Async-confirming modal | `ActionModal` | Same action contract as `ActionDrawer`. |

## Current public sources

- Fields: `packages/xc-antd/src/TextField/field/`
- Forms: `packages/xc-antd/src/SchemaForm/`, `packages/xc-antd/src/FormGroup/`
- Tables: `packages/xc-antd/src/CrudTable/`, `packages/xc-antd/src/HocTable/`
- Lists: `packages/xc-antd/src/ListPanel/`, `packages/xc-antd/src/ListTree/`, `packages/xc-antd/src/GroupedSelect/`
- Media: `packages/xc-antd/src/ImageUpload/`
- Rich content: `packages/xc-antd/src/RichTextEditor/`
- Maps: `packages/xc-antd/src/AmapEditor/`
- QR codes: `packages/xc-antd/src/QRCode/`
- Sensitive data: `packages/xc-antd/src/SensitiveData/`
- Overlays: `packages/xc-antd/src/ActionOverlay/`
- Public barrel: `packages/xc-antd/src/index.ts`

## Example routes

- TextField: `/pro-field`
- HocTable: `/table`
- CrudTable: `/crud-table`
- SchemaForm: `/schema-form`
- FormGroup: `/form-group`
- Lists: `/tree-select`
- Grouped multi-select: `/grouped-select`
- Image upload: `/image-upload`
- Rich text editor: `/rich-text-editor`
- AMap editor: `/amap-editor`
- QR code: `/qr-code`
- Sensitive data: `/sensitive-data`
- Overlays: `/action-overlay`

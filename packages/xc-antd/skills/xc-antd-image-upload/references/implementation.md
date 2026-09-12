# Implementation guide

## Architecture

```text
packages/xc-antd/src/ImageUpload/
├── ImageUpload.tsx       # selection, validation, file list, preview, upload
├── ImageCropDrawer.tsx  # crop session and batch navigation
├── types.ts             # public API, no cropper-specific types
├── utils.ts             # validation, response mapping, Canvas, concurrency
├── style.css
└── index.ts
```

`react-advanced-cropper` is an implementation dependency and is externalized by
the optional library validation build. Its stylesheet is imported by the
published source style entry.

## Processing pipeline

1. Ant Design Upload provides selected files.
2. Validate `accept`, size, count, then the consumer `beforeUpload` callback.
3. If cropping is enabled, send the validated batch to one crop drawer session.
4. Process images sequentially; preserve skipped originals and cropped results in input order.
5. Convert cropper Canvas output to a `File`, applying round masking when requested.
6. Upload with bounded concurrency, or retain pending files for `uploadPendingFiles()`.
7. Resolve server response URLs, update the controlled file list, and revoke temporary URLs.

## Invariants

- Free rectangular cropping omits `aspectRatio`; fixed ratios use stencil props.
- `canMoveBox` controls stencil movement; `fixedBox` disables stencil resizing.
- `movable`, `scalable`, and `rotatable` control image transforms through cropper background-wrapper props.
- The component owns only object URLs it created. Revoke them on replacement, removal, clear, or unmount.
- Removing an uploading file aborts its request. An aborted request must not restore an error row.
- Round output uses `CircleStencil` for UI and a Canvas ellipse mask for the actual file.
- Never run several crop drawers simultaneously; upload concurrency is independent from crop sequencing.

## Checks

```bash
bun test packages/xc-antd/tests/ImageUpload.test.tsx
bun test packages/xc-antd/tests/ImageUpload.utils.test.ts
bunx eslint packages/xc-antd/src/ImageUpload apps/docs/src/pages/ImageUploadDemo.tsx
bun run build
bun run build:docs
```

Use the `/image-upload` docs route for interactive file, crop, preview, and upload verification.

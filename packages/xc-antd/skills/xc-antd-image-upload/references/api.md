# ImageUpload and ImageCropDrawer API

Use `ImageUpload<ResponseType>` for controlled image selection, validation,
preview, optional cropping, and upload.

```tsx
<ImageUpload<UploadResponse>
  value={files}
  onChange={setFiles}
  multiple
  maxCount={5}
  customUpload={uploadImage}
  crop={{
    aspectRatio: 16 / 9,
    movable: true,
    scalable: true,
    rotatable: true,
    outputWidth: 1920,
    format: 'jpeg',
    quality: 0.9,
  }}
/>
```

Important behavior:

- `value` is an Ant Design-compatible `ImageUploadFile[]`; use `onChange` for controlled state.
- Configure either `customUpload` or `action` when automatic upload is enabled.
- `beforeUpload` runs after built-in MIME/extension and size validation.
- Crop selection is sequential; completed files upload with the configured concurrency.
- `autoUploadAfterCrop={false}` retains cropped files until `ref.uploadPendingFiles()`.
- `resolveResponse` maps non-standard server responses to `{ url, name }`.
- Rectangular stencils support free movement/resizing when `aspectRatio` is absent.
- `shape: 'round'` uses a circle stencil and applies a real Canvas mask; prefer PNG/WebP for transparent corners.
- Remote editing can taint Canvas without correct CORS headers. Local selected files use object URLs and are safe.
- The component owns and revokes its temporary object URLs and aborts active uploads on removal/unmount.

Use `ImageCropDrawer` directly when files are selected or uploaded by another workflow.
Its public API exposes `File` and `ImageCropResult`, not react-advanced-cropper types.

Source: `packages/xc-antd/src/ImageUpload/`; live example: `apps/docs/src/pages/ImageUploadDemo.tsx`.

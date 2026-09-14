---
name: xc-antd-image-upload
description: Build, integrate, or troubleshoot @zhilv/xc-antd ImageUpload and ImageCropDrawer in React. Use for image upload, preview, validation, custom upload requests, batch cropping, avatar cropping, crop ratios, Canvas output, or react-advanced-cropper behavior. Do not use for generic file uploads that do not use xc-antd.
---

# xc-antd ImageUpload

Use the public xc-antd API rather than exposing `react-advanced-cropper` to business code.

## Route the task

- Using `ImageUpload` or `ImageCropDrawer`: read [references/api.md](references/api.md).
- Modifying this component inside the xc-antd repository: also read [references/implementation.md](references/implementation.md).

## Source of truth

Inside this repository, inspect:

- `packages/xc-antd/src/ImageUpload/types.ts`
- `packages/xc-antd/src/ImageUpload/ImageUpload.tsx`
- `packages/xc-antd/src/ImageUpload/ImageCropDrawer.tsx`
- `apps/docs/src/pages/ImageUploadDemo.tsx`

In a consuming project, inspect its installed `node_modules/@zhilv/xc-antd/src/ImageUpload/` source and types; installed source wins over this reference.

## Working rules

- Use `ImageUploadFile<ResponseType>[]` for controlled values; do not convert the state to comma-separated URLs inside the component.
- Choose `customUpload` for SDK, signed URL, or non-standard API workflows. Use `resolveResponse` when the response URL is not in a supported default shape.
- Keep upload and crop concerns separate. Use `ImageCropDrawer` directly when another workflow owns file selection or upload.
- Preserve object URL cleanup, request aborts, batch order, and concurrency limits.
- Use PNG or WebP for transparent round output. JPEG round output requires a fill color.
- Treat remote-image Canvas output as CORS-sensitive.
- Do not add another crop library or leak cropper refs/types through the public API.

## Verification

For repository changes, run the ImageUpload tests, ESLint, library build, docs build, and the `/image-upload` example. If the public API changes, update this Skill in the same change.

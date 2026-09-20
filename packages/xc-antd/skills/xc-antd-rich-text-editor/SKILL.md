---
name: xc-antd-rich-text-editor
description: Build, integrate, or troubleshoot xc-antd RichTextEditor in React. Use for HTML rich content, Quill toolbars and formats, controlled editing, read-only preview, validation state, SSR, or react-quill-new behavior. Do not use for plain textarea or Markdown editors.
---

# xc-antd RichTextEditor

Use the public `RichTextEditor` API rather than exposing React Quill directly to
business code.

## Route the task

- Using `RichTextEditor`: read [references/api.md](references/api.md).
- Modifying the component inside the xc-antd repository: also read [references/implementation.md](references/implementation.md).

## Source of truth

Inside this repository, inspect:

- `packages/xc-antd/src/RichTextEditor/types.ts`
- `packages/xc-antd/src/RichTextEditor/RichTextEditor.tsx`
- `packages/xc-antd/src/RichTextEditor/config.ts`
- `apps/docs/src/pages/RichTextEditorDemo.tsx`

In a consuming project, inspect the installed
`node_modules/xc-antd/src/RichTextEditor/` source and types; installed source
wins over this reference.

## Working rules

- Treat the value as HTML and sanitize untrusted output at the server or final rendering trust boundary.
- Preserve controlled and uncontrolled semantics; do not pass `value={undefined}` as an uncontrolled value.
- Pass `modules` and `formats` together when registering formats outside the defaults.
- Keep the browser-only editor lazily loaded so importing `xc-antd` remains SSR-safe.
- Do not replace `react-quill-new` with the unmaintained original package while the library supports React 19.

## Verification

For repository changes, run the RichTextEditor tests, package typecheck,
ESLint, library build, docs build, and the `/rich-text-editor` example. Update
this Skill when the public API or Quill integration changes.

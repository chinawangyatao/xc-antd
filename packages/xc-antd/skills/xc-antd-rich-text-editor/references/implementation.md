# Implementation guide

## Architecture

```text
packages/xc-antd/src/RichTextEditor/
├── RichTextEditor.tsx  # wrapper, lazy loading, controlled boundary
├── config.ts           # default formats and modules
├── types.ts            # public API
├── style.css           # Ant Design-aligned field states
└── index.ts
```

The original `react-quill@2.0.0` supports React 16–18 and relies on APIs removed
from React 19. This component uses `react-quill-new`, the maintained React
19-compatible line, while preserving the familiar React Quill behavior.

## Invariants

- Import React Quill with `React.lazy`; a runtime import at module scope makes
  Node/SSR imports fail because Quill reads `document` during initialization.
- Keep Quill CSS in the published style entry and the component style import.
- Decide controlled mode by `value !== undefined`; conditionally pass either
  `value` or `defaultValue` to React Quill.
- `disabled` implies `readOnly` and removes the editor from tab order.
- Default read-only mode removes the toolbar. Explicit custom modules remain
  caller-owned.
- Do not automatically sanitize or rewrite saved HTML inside the component;
  sanitization policy belongs to the application trust boundary.

## Checks

```bash
bun test packages/xc-antd/tests/RichTextEditor.test.tsx
bunx eslint packages/xc-antd/src/RichTextEditor apps/docs/src/pages/RichTextEditorDemo.tsx
bun run --filter xc-antd typecheck
bun run build
bun run build:docs
```

Use `/rich-text-editor` to verify toolbar interaction, controlled preview,
read-only display, disabled state, and narrow-screen wrapping.

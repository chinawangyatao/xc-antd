---
name: xc-antd-amap-editor
description: Build, integrate, or troubleshoot xc-antd AmapEditor in React. Use for Gaode/AMap markers, polyline drawing, path closing, POI search, map controls, browser location, API keys, security codes, or @uiw/react-amap behavior. Do not use for another map provider.
---

# xc-antd AmapEditor

Use `AmapEditor` as the business boundary. Keep AMap overlay instances inside
the component and persist longitude/latitude tuples in application state.

## Route the task

- Using `AmapEditor`: read [references/api.md](references/api.md).
- Modifying the component inside xc-antd: also read [references/implementation.md](references/implementation.md).

## Source of truth

Inside this repository, inspect:

- `packages/xc-antd/src/AmapEditor/types.ts`
- `packages/xc-antd/src/AmapEditor/AmapEditor.tsx`
- `packages/xc-antd/src/AmapEditor/AmapEditorCanvas.tsx`
- `packages/xc-antd/src/AmapEditor/utils.ts`
- `apps/docs/src/pages/AmapEditorDemo.tsx`

In a consuming project, inspect the installed
`node_modules/xc-antd/src/AmapEditor/` source and types; installed source wins
over this reference.

## Working rules

- Use `[longitude, latitude]` in GCJ-02 coordinates. Do not reverse tuple order.
- Use controlled `markers` and `path` when data must be saved; imperative ref methods still call the matching change callbacks.
- Never hardcode or expose AMap keys and security codes in source. Inject them through application configuration.
- Keep `@uiw/react-amap` behind the browser-only lazy boundary because its loader reads `window` at module initialization.
- Treat a closed path as a path whose final coordinate repeats the first coordinate.

## Verification

Run the focused AmapEditor tests, typecheck, ESLint, library build, docs build,
and the `/amap-editor` example. A real map interaction check requires a valid
Web JSAPI key, matching security code, allowed domain, and network access.

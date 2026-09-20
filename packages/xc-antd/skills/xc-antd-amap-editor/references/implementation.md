# Implementation guide

## Architecture

```text
packages/xc-antd/src/AmapEditor/
├── AmapEditor.tsx        # SSR-safe shell, key state, security setup
├── AmapEditorCanvas.tsx  # @uiw map, overlays, toolbar, search, ref actions
├── types.ts              # public data and callback contracts
├── utils.ts              # distance, normalization, closure, undo
├── style.css
└── index.ts
```

## Invariants

- `@uiw/react-amap` imports `@amap/amap-jsapi-loader`, which reads `window` at
  module initialization. Only `AmapEditorCanvas` may import it at runtime, and
  the shell must load that module lazily in a browser.
- Set `window._AMapSecurityConfig.securityJsCode` before rendering the lazy
  canvas so the loader sees the security configuration.
- Keep application state serializable. Do not expose Marker, Polyline, or Map
  instances through change events; only `getMap()` returns the map instance.
- Current location is separate from business `markers`. Use the AMap
  Geolocation plugin with coordinate conversion and render the result as a
  dedicated DOM Marker with a CSS breathing halo. Respect reduced-motion
  preferences.
- Normalize new marker/path arrays and never mutate arrays supplied by callers.
- Closed paths repeat the first point at the end. Render only unique path-point
  circles while giving Polyline the complete closed path.
- Distance thresholds use a Haversine calculation in meters, not an arbitrary
  longitude/latitude delta.
- Search calls the AMap AutoComplete service and renders suggestions through
  Ant Design AutoComplete. Do not delegate popup DOM rendering back to AMap.
- Match the official wrapper when loading the service: use
  `AMap.Autocomplete` for the legacy `AMap.v` API and `AMap.AutoComplete` for
  v2. Wait for the `AMap.plugin` callback before searching.
- Keep Ant Design AutoComplete open state uncontrolled. Supply disabled loading
  and empty options so its built-in empty-options rule does not hide feedback.
- Defer the map's final `clearMap`/`destroy` calls during React unmount so
  `@uiw/react-amap` overlays and controls can remove themselves first. This
  avoids route-change cleanup failures on React 19.
- API keys are public browser credentials but still belong in deployment
  configuration. Security codes and domain restrictions must match the AMap
  console setup.

## Checks

```bash
bun test packages/xc-antd/tests/AmapEditor.test.tsx
bunx eslint packages/xc-antd/src/AmapEditor apps/docs/src/pages/AmapEditorDemo.tsx
bun run --filter xc-antd typecheck
bun run build
bun run build:docs
```

With valid credentials, verify all three modes, path close/undo/clear, search
selection, marker accumulation, controls, and toolbar wrapping on a narrow
viewport.

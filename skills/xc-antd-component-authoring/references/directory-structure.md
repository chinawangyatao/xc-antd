# Directory structure

Use this default shape:

```text
packages/xc-antd/src/FeatureName/
├── FeatureName.tsx
├── types.ts             # when public types are substantial
├── utils.ts             # pure reusable logic
├── Subcomponent.tsx      # only for a meaningful responsibility
├── style.css
└── index.ts
```

Small components may need only `FeatureName.tsx`, `style.css`, and `index.ts`.

Current examples:

- `CrudTable`: component, types, utils, search form, column settings, style, barrel.
- `HocTable`: component, types, utils, toolbar, editable cell, table filter, column settings, style, barrel.
- `ListPanel` and `ListTree`: focused component, style, barrel.
- `ActionOverlay`: two public overlays sharing one internal implementation module.

## Placement rules

- Public exports belong in the feature `index.ts`, then in `packages/xc-antd/src/index.ts`.
- Internal helpers are not exported merely to make tests convenient; tests may import a focused internal module directly.
- Shared code belongs in `packages/xc-antd/src/shared/` only when at least two feature components use the same behavior.
- Component examples belong in `apps/docs/src/pages/`.
- Tests belong in `packages/xc-antd/tests/` and are named after the public feature or utility.
- Do not place sample API payloads, copied production records, README manuals, build configuration, or another package manifest inside a feature directory.

When moving files, search all imports before deleting legacy paths. Prefer one deprecated re-export over two implementations when compatibility is needed.

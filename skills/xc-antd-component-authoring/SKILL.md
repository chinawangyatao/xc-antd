---
name: xc-antd-component-authoring
description: Create, refactor, or review components in the @zhilv/xc-antd library. Use for component architecture, directory structure, public TypeScript APIs, compatibility migrations, docs examples, styling, and tests inside this repository; do not use merely to consume an existing xc-antd component.
---

# xc-antd component authoring

Build components that match the current library rather than preserving accidental legacy structure.

## Read before editing

1. Read the target component, its public `index.ts`, root `packages/xc-antd/src/index.ts`, usages, tests, and docs page.
2. Read one comparable current component; do not copy unrelated capabilities.
3. Check `git status` and preserve unrelated work.

Read the relevant guidance:

- Structure or file moves: [references/directory-structure.md](references/directory-structure.md)
- Public props, names, controlled state, and compatibility: [references/component-api.md](references/component-api.md)
- Tests, builds, and docs verification: [references/testing-checklist.md](references/testing-checklist.md)

## Repository invariants

- Keep one feature directory under `packages/xc-antd/src/` and one public barrel.
- Put demo data and business examples in `apps/docs`, never in the published component source.
- Do not add component-local `package.json` or `tsconfig.json`; the workspace package owns them.
- Prefer a flat feature directory. Add a subdirectory only for a substantial independent family such as `TextField`.
- Use exported interfaces and generics; avoid `any` when `unknown` or a typed callback is sufficient.
- Use `xc-<component>__<element>` CSS classes and a feature `style.css`. Keep styles scoped by the feature root.
- Preserve Ant Design passthrough through an explicit `tableProps`, `fieldProps`, or equivalent boundary when spreading everything would blur wrapper semantics.
- New names are canonical. Keep an old name only when compatibility is required, export it as a deprecated alias, and do not maintain a second implementation.
- Do not create inert buttons or callbacks. Every visible default action must work or be supplied by the caller.
- Keep async loading, rejection, and controlled/uncontrolled behavior correct.

## Completion

Update the matching docs page with realistic local data and observable interactions. Add focused tests for pure state transformations and at least one render contract for a new public component.

Run the commands in [references/testing-checklist.md](references/testing-checklist.md). Report any pre-existing warning separately from failures.

---
name: xc-antd
description: Build and troubleshoot React interfaces with @zhilv/xc-antd. Use when a task mentions xc-antd, TextField, SchemaForm, FormGroup, CrudTable, HocTable, ListPanel, ListTree, GroupedSelect, ActionDrawer, or ActionModal. Covers component selection, current APIs, typed usage, examples, and verification; do not use for generic Ant Design work that does not use this library.
---

# xc-antd

Use the installed or repository-matched API. Do not write component props from memory.

## Choose the component

Read [references/component-map.md](references/component-map.md) when component selection is unclear or spans multiple families.

- Fields and schema-driven forms: read [references/text-field.md](references/text-field.md) for `TextField`; read [references/forms.md](references/forms.md) for `SchemaForm` or `FormGroup`.
- Tables: read [references/crud-table.md](references/crud-table.md) for request/query CRUD flows; read [references/hoc-table.md](references/hoc-table.md) for local data and inline new rows.
- Lists, trees, and grouped selection: read [references/lists.md](references/lists.md).
- Image upload or cropping: prefer the dedicated `xc-antd-image-upload` Skill.
- Drawers, modals, async confirmation, or unsaved-change prompts: read [references/overlays.md](references/overlays.md).

Read only the references needed for the current task.

## Source of truth

Inside this repository:

1. Read the component's `types.ts`, component file, and `index.ts` under `packages/xc-antd/src/`.
2. Read its live example under `apps/docs/src/pages/`.
3. Check focused tests under `packages/xc-antd/tests/` for behavioral contracts.

In a consuming repository, inspect the installed version first:

```bash
npm ls @zhilv/xc-antd --depth=0
```

Then read `node_modules/@zhilv/xc-antd/src/index.ts` and the relevant source `types.ts`. The package publishes ESM TypeScript/TSX source, so installed source is authoritative when it differs from this repository.

## Implementation rules

- Import public components and types from `@zhilv/xc-antd`; import `@zhilv/xc-antd/style` once and ensure the consumer build handles ESM TS/TSX and Tailwind CSS v4.
- Preserve generic record/value types instead of falling back to `any`.
- Prefer canonical names. `SimpleTable`, `CRUDTable`, `XcColumnDef`, and related names are compatibility aliases; new code uses `HocTable`, `CrudTable`, and `HocTableColumn`.
- `InputTree` no longer exists. Use `ListTree`.
- Keep controlled props controlled. Do not pass a controlled prop with `undefined` when the underlying Ant Design component detects control by property presence.
- Use existing async and confirmation hooks supplied by components instead of duplicating them in callers.
- If an API detail is absent from a reference, inspect the current type declaration rather than guessing.

## Verification

For changes in this repository, run the smallest focused test first, then:

```bash
bun test packages/xc-antd/tests
bun run build
bun run build:docs
```

Run ESLint on changed files. For UI changes, update the matching docs page and verify the local route when browser control is available.

# Testing checklist

## During implementation

- Add a pure utility test for filtering, ordering, normalization, transforms, or validation logic.
- Add a render test for public markup, defaults, compatibility aliases, or semantic state.
- Use real library values when behavior depends on prototypes or `this` binding; for example, test date normalization with a real Dayjs instance.
- Reproduce a reported regression before considering it fixed.

## Required commands

Run the focused test first:

```bash
bun test packages/xc-antd/tests/<Feature>.test.tsx
```

Then run:

```bash
bun test packages/xc-antd/tests
bunx eslint <changed-source-and-test-files>
bun run build
bun run build:docs
git diff --check
```

The package source typecheck must pass without TypeScript errors. The optional
Vite build verifies browser bundling and CSS, but declarations are not generated
because the published type entry is the TypeScript source itself.

When package metadata, the installer, or Skills change, also run:

```bash
bun test packages/xc-antd/tests/SkillInstaller.test.ts
npm pack --dry-run --workspace xc-antd --json
```

Confirm the pack list contains `src/`, `skills/`, and `scripts/install-skills.mjs`.
It must not contain `dist/`, tests, docs, nested component package manifests, or
workspace-only files.

## Docs verification

- Update or add the route in `apps/docs/src/App.tsx` when introducing a public component.
- Demonstrate real interactions rather than static placeholders.
- Test the local route at desktop and narrow widths when browser control is available.
- Verify menus, popovers, date pickers, confirmation dialogs, controlled state, and overflow behavior relevant to the change.

Do not claim visual interaction was tested when only builds or HTTP module checks ran.

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

The package build must produce declarations without TypeScript errors. Treat a successful exit containing a TypeScript diagnostic as a failure to fix.

## Docs verification

- Update or add the route in `apps/docs/src/App.tsx` when introducing a public component.
- Demonstrate real interactions rather than static placeholders.
- Test the local route at desktop and narrow widths when browser control is available.
- Verify menus, popovers, date pickers, confirmation dialogs, controlled state, and overflow behavior relevant to the change.

Do not claim visual interaction was tested when only builds or HTTP module checks ran.

---
name: xc-antd-permission
description: Build, integrate, or troubleshoot xc-antd PermissionProvider, PermissionGuard, usePermission, and checkPermission. Use for permission-code injection, all/any checks, UI fallbacks, menu filtering, resource-aware rules, or permission loading states; do not treat frontend visibility as backend authorization.
---

# xc-antd Permission

Use one `PermissionProvider` near the application root, then use
`PermissionGuard` for rendering and `usePermission` for menus, routes, event
handlers, and other imperative decisions. Read [references/api.md](references/api.md)
for the complete contract and examples.

## Source of truth

Inside this repository, inspect:

- `packages/xc-antd/src/Permission/types.ts`
- `packages/xc-antd/src/Permission/PermissionContext.ts`
- `packages/xc-antd/src/Permission/PermissionProvider.tsx`
- `packages/xc-antd/src/Permission/checkPermission.ts`
- `apps/docs/src/pages/PermissionDemo.tsx`

In a consuming project, inspect the installed
`node_modules/xc-antd/src/Permission/` source and types.

## Working rules

- The default matcher performs exact permission-code matching. One code uses
  inclusion; multiple codes default to `all` and support `mode="any"`.
- Missing providers, empty requirements, loading state, and matcher exceptions
  fail closed.
- A check-level matcher overrides the provider matcher; the provider matcher
  overrides the default matcher.
- Pass record-specific data through `resource` for ownership or state rules.
- `PermissionGuard` adds no DOM wrapper. Use `fallback` for denied content and
  `loadingFallback` while permissions load.
- Frontend checks control UI and interaction only. APIs must authorize every
  protected operation independently.

## Verification

Run Permission tests, typecheck, ESLint, library build, docs build, and the
`/permission` example after changes.

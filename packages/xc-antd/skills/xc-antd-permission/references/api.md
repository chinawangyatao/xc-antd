# Permission API

## Root provider

```tsx
<PermissionProvider
  permissions={permissionCodes}
  loading={loading}
  matcher={customMatcher}
>
  <App />
</PermissionProvider>
```

`loading=true` makes every decision deny until current permissions are ready.
The nearest provider replaces an outer provider.

## Render guard

```tsx
<PermissionGuard
  permission={['article:update', 'article:delete']}
  mode="any"
  fallback={<Button disabled>Manage</Button>}
>
  <Button>Manage</Button>
</PermissionGuard>
```

Use `resource={record}` when a provider or local matcher needs record data.
`fallback` and `loadingFallback` default to `null`.

## Hook and pure function

```tsx
const { can, loading, permissions } = usePermission();

const visibleItems = items.filter((item) => (
  !item.permission || can(item.permission, { mode: item.mode })
));
```

Outside React, call:

```ts
checkPermission(grantedCodes, ['user:update', 'user:delete'], {
  mode: 'any',
});
```

## Matcher

Matchers are synchronous and receive `granted`, normalized `required`, `mode`,
and optional `resource`. A local matcher passed to `can` or `PermissionGuard`
takes precedence over the provider matcher. Thrown errors deny access and call
the nearest `onMatcherError` handler.

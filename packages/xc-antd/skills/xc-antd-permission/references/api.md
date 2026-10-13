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

### Action metadata

```tsx
<PermissionGuard
  permission="order:create"
  action="create"
  label="新建订单"
>
  <Button>新建订单</Button>
</PermissionGuard>
```

`action?: string` is the operation identifier and `label?: string` is its
human-readable name. Both are optional declaration metadata for business-side
source scanning (for example, a Vite plugin generating a permission CSV).
Use static string literals when a scanner needs to extract them reliably.
They do not change permission decisions, enter matcher parameters, add DOM
attributes or wrappers, or replace child text. Route association and CSV
generation remain the consuming application's responsibility.

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

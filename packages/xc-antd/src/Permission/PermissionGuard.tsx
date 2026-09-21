import type { ReactElement } from 'react';
import { usePermission } from './PermissionContext';
import type { PermissionGuardProps } from './types';

export function PermissionGuard<TResource = unknown>({
  permission,
  mode,
  resource,
  matcher,
  onMatcherError,
  fallback = null,
  loadingFallback = null,
  children = null,
}: PermissionGuardProps<TResource>): ReactElement | null {
  const { can, loading } = usePermission();
  if (loading) return <>{loadingFallback}</>;

  const allowed = can(permission, {
    matcher,
    mode,
    onMatcherError,
    resource,
  });
  return <>{allowed ? children : fallback}</>;
}

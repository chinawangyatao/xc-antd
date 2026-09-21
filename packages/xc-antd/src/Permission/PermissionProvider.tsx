import React from 'react';
import { checkPermission } from './checkPermission';
import { PermissionContext } from './PermissionContext';
import type {
  PermissionCan,
  PermissionMatcher,
  PermissionProviderProps,
} from './types';

export function PermissionProvider({
  permissions,
  loading = false,
  matcher,
  onMatcherError,
  children,
}: PermissionProviderProps) {
  const granted = React.useMemo(() => [...permissions], [permissions]);
  const grantedSet = React.useMemo(() => new Set(granted), [granted]);
  const defaultMatcher = React.useMemo<PermissionMatcher>(() => ({
    required,
    mode,
  }) => (
    mode === 'any'
      ? required.some((code) => grantedSet.has(code))
      : required.every((code) => grantedSet.has(code))
  ), [grantedSet]);

  const can = React.useCallback<PermissionCan>((permission, options = {}) => {
    if (loading) return false;
    return checkPermission(granted, permission, {
      ...options,
      matcher: options.matcher ?? matcher ?? defaultMatcher,
      onMatcherError: options.onMatcherError ?? onMatcherError,
    });
  }, [defaultMatcher, granted, loading, matcher, onMatcherError]);

  const value = React.useMemo(() => ({
    can,
    loading,
    permissions: granted,
  }), [can, granted, loading]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

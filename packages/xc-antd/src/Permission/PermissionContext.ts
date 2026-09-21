import React from 'react';
import type { PermissionCan, UsePermissionResult } from './types';

const deny: PermissionCan = () => false;

export const PermissionContext = React.createContext<UsePermissionResult>({
  can: deny,
  loading: false,
  permissions: [],
});

PermissionContext.displayName = 'PermissionContext';

export function usePermission(): UsePermissionResult {
  const context = React.useContext(PermissionContext);
  return React.useMemo(() => ({
    can: context.can,
    loading: context.loading,
    permissions: context.permissions,
  }), [context.can, context.loading, context.permissions]);
}

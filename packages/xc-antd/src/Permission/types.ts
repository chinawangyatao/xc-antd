import type { ReactNode } from 'react';

export type PermissionCode = string;
export type PermissionRequirement = PermissionCode | readonly PermissionCode[];
export type PermissionMode = 'all' | 'any';

export interface PermissionMatchParams<TResource = unknown> {
  granted: readonly PermissionCode[];
  required: readonly PermissionCode[];
  mode: PermissionMode;
  resource?: TResource;
}

export type PermissionMatcher<TResource = unknown> = (
  params: PermissionMatchParams<TResource>,
) => boolean;

export type PermissionMatcherErrorHandler<TResource = unknown> = (
  error: unknown,
  params: PermissionMatchParams<TResource>,
) => void;

export interface PermissionCheckOptions<TResource = unknown> {
  mode?: PermissionMode;
  resource?: TResource;
  matcher?: PermissionMatcher<TResource>;
  onMatcherError?: PermissionMatcherErrorHandler<TResource>;
}

export interface PermissionCan {
  <TResource = unknown>(
    permission: PermissionRequirement,
    options?: PermissionCheckOptions<TResource>,
  ): boolean;
}

export interface PermissionProviderProps {
  permissions: readonly PermissionCode[];
  loading?: boolean;
  matcher?: PermissionMatcher;
  onMatcherError?: PermissionMatcherErrorHandler;
  children?: ReactNode;
}

export interface PermissionGuardProps<TResource = unknown>
  extends PermissionCheckOptions<TResource> {
  permission: PermissionRequirement;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  children?: ReactNode;
}

export interface UsePermissionResult {
  permissions: readonly PermissionCode[];
  loading: boolean;
  can: PermissionCan;
}

import type {
  PermissionCheckOptions,
  PermissionCode,
  PermissionMatchParams,
  PermissionMatcher,
  PermissionRequirement,
} from './types';

function normalizeRequirement(permission: PermissionRequirement) {
  const required = typeof permission === 'string'
    ? [permission]
    : [...permission];
  if (!required.length || required.some((code) => !code)) return undefined;
  return required;
}

export const defaultPermissionMatcher: PermissionMatcher = ({
  granted,
  required,
  mode,
}) => {
  if (!required.length) return false;
  const grantedSet = new Set(granted);
  return mode === 'any'
    ? required.some((code) => grantedSet.has(code))
    : required.every((code) => grantedSet.has(code));
};

export function checkPermission<TResource = unknown>(
  granted: readonly PermissionCode[],
  permission: PermissionRequirement,
  options: PermissionCheckOptions<TResource> = {},
) {
  const required = normalizeRequirement(permission);
  if (!required) return false;

  const params: PermissionMatchParams<TResource> = {
    granted,
    required,
    mode: options.mode ?? 'all',
    resource: options.resource,
  };

  try {
    return (options.matcher ?? defaultPermissionMatcher)(params);
  } catch (error) {
    options.onMatcherError?.(error, params);
    return false;
  }
}

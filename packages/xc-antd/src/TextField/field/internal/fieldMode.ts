import type { ProFieldFCMode } from '../../provider';

export function isProFieldReadMode(mode: ProFieldFCMode | undefined): boolean {
  return mode === 'read';
}

export function isProFieldEditOrUpdateMode(
  mode: ProFieldFCMode | undefined,
): boolean {
  return mode === 'edit' || mode === 'update';
}

export function isProFieldEditOnlyMode(
  mode: ProFieldFCMode | undefined,
): boolean {
  return mode === 'edit';
}

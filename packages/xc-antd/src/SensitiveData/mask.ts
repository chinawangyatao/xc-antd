import type { SensitiveDataType } from './types';

function repeatMask(length: number, maskCharacter: string) {
  return maskCharacter.repeat(Math.max(0, length));
}

export function maskText(
  value: string,
  keepPrefix = 0,
  keepSuffix = 0,
  maskCharacter = '*',
) {
  const characters = Array.from(value);
  if (!characters.length) return value;
  if (keepPrefix + keepSuffix >= characters.length) {
    return repeatMask(characters.length, maskCharacter);
  }
  const prefix = characters.slice(0, keepPrefix).join('');
  const suffix = keepSuffix > 0 ? characters.slice(-keepSuffix).join('') : '';
  return `${prefix}${repeatMask(
    characters.length - keepPrefix - keepSuffix,
    maskCharacter,
  )}${suffix}`;
}

export function maskPhone(value: string, maskCharacter = '*') {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length < 7) return value;
  return maskText(cleaned, 3, 4, maskCharacter);
}

export function maskEmail(value: string, maskCharacter = '*') {
  const separatorIndex = value.indexOf('@');
  if (separatorIndex <= 0) return value;
  const local = value.slice(0, separatorIndex);
  const domain = value.slice(separatorIndex + 1);
  if (local.length <= 1) return value;
  return `${maskText(local, 1, 1, maskCharacter)}@${domain}`;
}

export function maskName(value: string, maskCharacter = '*') {
  if (!value) return value;
  if (/^[\u4e00-\u9fa5]+$/.test(value)) {
    if (value.length === 1) return value;
    if (value.length === 2) return `${value[0]}${maskCharacter}`;
    return maskText(value, 1, 1, maskCharacter);
  }
  return value.split(' ').map((part) =>
    part.length <= 1
      ? part
      : `${part[0]}${repeatMask(part.length - 1, maskCharacter)}`,
  ).join(' ');
}

export function maskSensitiveValue(
  value: string,
  type: SensitiveDataType = 'text',
  maskCharacter = '*',
) {
  if (!value) return value;
  switch (type) {
    case 'phone':
      return maskPhone(value, maskCharacter);
    case 'email':
      return maskEmail(value, maskCharacter);
    case 'name':
      return maskName(value, maskCharacter);
    case 'number':
    case 'id':
      return maskText(value, 3, 4, maskCharacter);
    case 'key':
      return maskText(value, 6, 4, maskCharacter);
    case 'idCard':
      return maskText(value.replace(/\s/g, ''), 6, 4, maskCharacter);
    case 'bankCard':
      return maskText(value.replace(/\D/g, ''), 6, 4, maskCharacter);
    case 'address':
      return maskText(value, 6, 0, maskCharacter);
    case 'image':
      return value;
    case 'text':
    default:
      return maskText(value, 2, 2, maskCharacter);
  }
}

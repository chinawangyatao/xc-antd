import { describe, expect, test } from 'bun:test';
import {
  maskEmail,
  maskName,
  maskPhone,
  maskSensitiveValue,
  maskText,
} from '../src/SensitiveData';

describe('SensitiveData masking', () => {
  test('masks phone, email and names with their domain rules', () => {
    expect(maskPhone('15624181187')).toBe('156****1187');
    expect(maskEmail('1176317790@qq.com')).toBe('1********0@qq.com');
    expect(maskName('王煦澄')).toBe('王*澄');
    expect(maskName('王鹏')).toBe('王*');
    expect(maskName('Alice Smith')).toBe('A**** S****');
  });

  test('masks identifiers, cards, addresses, keys and general text', () => {
    expect(maskSensitiveValue('2013155805617700864', 'id'))
      .toBe('201************0864');
    expect(maskSensitiveValue('37021219900101123X', 'idCard'))
      .toBe('370212********123X');
    expect(maskSensitiveValue('6222021234567890123', 'bankCard'))
      .toBe('622202*********0123');
    expect(maskSensitiveValue('山东省青岛市崂山区中韩街道', 'address'))
      .toBe('山东省青岛市*******');
    expect(maskSensitiveValue('sk_live_1234567890', 'key'))
      .toBe('sk_liv********7890');
    expect(maskSensitiveValue('TD277216', 'text')).toBe('TD****16');
  });

  test('supports a custom mask character and short values', () => {
    expect(maskText('123456789', 2, 2, '•')).toBe('12•••••89');
    expect(maskSensitiveValue('123456', 'id')).toBe('******');
    expect(maskPhone('12345')).toBe('12345');
  });
});

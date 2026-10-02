import { describe, expect, test } from 'bun:test';
import { getTextByLocale } from '../src/TextField/field/components/Money/moneyFormat';

describe('TextField money formatting', () => {
  test('removes every grouping separator before formatting', () => {
    expect(getTextByLocale(false, '1,234,567.89', 2)).toBe('1,234,567.89');
    expect(getTextByLocale(false, 'not,a,number', 2)).toBe('notanumber');
  });
});

import { describe, expect, test } from 'bun:test';
import { resolveTagItems } from '../src/TextField/field/components/Tag';

const valueEnum = {
  design: { text: '设计', color: 'blue' },
  urgent: { text: '紧急', status: 'Error' },
};

describe('TextField tag', () => {
  test('resolves a single enum tag', () => {
    expect(resolveTagItems('design', valueEnum)).toEqual([
      {
        key: 'design-0',
        value: 'design',
        label: '设计',
        color: 'blue',
        disabled: undefined,
      },
    ]);
  });

  test('resolves multiple tags and status colors', () => {
    const items = resolveTagItems(['design', 'urgent'], valueEnum);
    expect(items.map((item) => [item.label, item.color])).toEqual([
      ['设计', 'blue'],
      ['紧急', 'red'],
    ]);
  });

  test('supports separator-based tag strings', () => {
    expect(resolveTagItems('alpha,beta', undefined, ',').map((item) => item.label))
      .toEqual(['alpha', 'beta']);
  });
});

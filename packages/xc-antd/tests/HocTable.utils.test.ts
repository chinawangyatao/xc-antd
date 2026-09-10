import { describe, expect, test } from 'bun:test';
import dayjs from 'dayjs';
import type { HocTableColumn, HocTableValidationRule } from '../src/HocTable';
import {
  createHocTableColumnSettings,
  extractHocTableFieldValue,
  filterHocTableData,
  mergeHocTableColumnSettings,
  moveHocTableColumnSetting,
  validateHocTableRow,
} from '../src/HocTable/utils';

interface Row {
  id: number;
  name: string;
  status: 'enabled' | 'disabled';
}

const columns: HocTableColumn<Row>[] = [
  { key: 'name', title: '姓名', dataIndex: 'name', filterable: true },
  {
    key: 'status',
    title: '状态',
    dataIndex: 'status',
    filterable: true,
    filterMode: 'select',
  },
];
const rows: Row[] = [
  { id: 1, name: '张三', status: 'enabled' },
  { id: 2, name: '李四', status: 'disabled' },
];

describe('HocTable filtering', () => {
  test('supports global fuzzy search and column exact filters', () => {
    expect(filterHocTableData(rows, columns, '张', {})).toEqual([rows[0]]);
    expect(filterHocTableData(rows, columns, '', { status: 'disabled' }))
      .toEqual([rows[1]]);
  });
});

describe('HocTable column settings', () => {
  test('creates, moves and reconciles settings', () => {
    const settings = createHocTableColumnSettings(columns, true, '操作');
    const moved = moveHocTableColumnSetting(settings, 'status', 'name');
    expect(moved.map((item) => item.key)).toEqual(['status', 'name', '__action__']);

    const hidden = moved.map((item) => item.key === 'name'
      ? { ...item, visible: false }
      : item);
    const reconciled = mergeHocTableColumnSettings(hidden, settings);
    expect(reconciled.find((item) => item.key === 'name')?.visible).toBe(false);
  });
});

describe('HocTable validation', () => {
  test('applies required and custom rules', () => {
    const rules: HocTableValidationRule[] = [
      { field: 'name', label: '姓名' },
      {
        field: 'status',
        label: '状态',
        rule: (value) => value === 'enabled' ? null : '状态不可用',
      },
    ];

    expect(validateHocTableRow({ id: 3, name: '', status: 'disabled' }, rules))
      .toEqual({ name: '姓名不能为空', status: '状态不可用' });
  });

  test('normalizes date editor values', () => {
    const dayjsValue = dayjs('2026-09-10 10:30:00');

    expect(extractHocTableFieldValue(dayjsValue, 'date')).toBe('2026-09-10');
    expect(extractHocTableFieldValue(dayjsValue, 'dateTime'))
      .toBe('2026-09-10 10:30:00');
  });
});

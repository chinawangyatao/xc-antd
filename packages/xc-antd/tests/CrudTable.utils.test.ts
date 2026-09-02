import { describe, expect, test } from 'bun:test';
import type { CrudTableColumn } from '../src/CrudTable';
import {
  buildRequestQuery,
  columnSettingsToState,
  createColumnSettings,
  filterLocalData,
  moveColumnSetting,
} from '../src/CrudTable/utils';

interface Row {
  id: number;
  name: string;
  status: string;
  range?: unknown[];
}

interface Query {
  name?: string;
  status?: string;
  range?: unknown[];
  start?: string;
  end?: string;
}

const columns: CrudTableColumn<Row, Query>[] = [
  { title: '姓名', dataIndex: 'name', valueType: 'text' },
  { title: '状态', dataIndex: 'status', valueType: 'select' },
  {
    title: '时间',
    key: 'range',
    dataIndex: 'range',
    search: {
      transform: (value) => {
        const range = value as unknown[];
        return { start: range?.[0] as string, end: range?.[1] as string };
      },
    },
  },
];

describe('CrudTable column settings', () => {
  test('applies persisted visibility and order', () => {
    const settings = createColumnSettings(columns, {
      status: { show: false, order: 0 },
      name: { show: true, order: 1 },
    });

    expect(settings.map((item) => item.key)).toEqual(['status', 'name', 'range']);
    expect(settings[0].visible).toBe(false);
  });

  test('moves a column and serializes the new state', () => {
    const settings = createColumnSettings(columns);
    const moved = moveColumnSetting(settings, 'range', 'name');
    const state = columnSettingsToState(moved);

    expect(moved.map((item) => item.key)).toEqual(['range', 'name', 'status']);
    expect(state.range.order).toBe(0);
  });
});

describe('CrudTable query processing', () => {
  const dayjsLike = (value: string) => ({
    $isDayjsObject: true,
    $d: new Date(value),
    format: () => value,
    valueOf: () => new Date(value).valueOf(),
  });

  test('normalizes date values returned by a transform', () => {
    const query = buildRequestQuery(
      { range: [dayjsLike('2026-01-01 00:00:00'), dayjsLike('2026-01-31 23:59:59')] },
      columns,
      'string',
    );

    expect(query).toEqual({
      start: '2026-01-01 00:00:00',
      end: '2026-01-31 23:59:59',
    });
  });

  test('filters local data using text and select semantics', () => {
    const rows: Row[] = [
      { id: 1, name: '张三', status: 'enabled' },
      { id: 2, name: '李四', status: 'disabled' },
    ];

    expect(filterLocalData(rows, { name: '张' }, columns)).toEqual([rows[0]]);
    expect(filterLocalData(rows, { status: 'disabled' }, columns)).toEqual([rows[1]]);
  });
});

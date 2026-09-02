import type {
  CrudTableColumn,
  CrudTableColumnState,
  CrudTableQuery,
  CrudValueEnum,
} from './types';

export interface ColumnSettingItem {
  key: string;
  label: string;
  visible: boolean;
  disabled: boolean;
}

export function getSearchActionOffset(
  itemCount: number,
  columnsPerRow: number,
  columnSpan: number,
): number {
  const remainder = itemCount % columnsPerRow;
  const emptyColumns =
    (columnsPerRow - 1 - remainder + columnsPerRow) % columnsPerRow;
  return emptyColumns * columnSpan;
}

export function getCrudColumnKey<
  RecordType extends object,
  Query extends CrudTableQuery,
>(
  column: CrudTableColumn<RecordType, Query>,
  index: number,
): string {
  return String(column.key ?? column.dataIndex ?? `column-${index}`);
}

function getColumnLabel(title: unknown, fallback: string): string {
  return typeof title === 'string' || typeof title === 'number'
    ? String(title)
    : fallback;
}

export function createColumnSettings<
  RecordType extends object,
  Query extends CrudTableQuery,
>(
  columns: CrudTableColumn<RecordType, Query>[],
  state: Record<string, CrudTableColumnState> = {},
): ColumnSettingItem[] {
  return columns
    .filter((column) => !column.hideInTable)
    .map((column, index) => {
      const key = getCrudColumnKey(column, index);
      return {
        key,
        label: getColumnLabel(column.title, String(column.dataIndex ?? key)),
        visible: state[key]?.show !== false,
        disabled: column.disableColumnSetting === true,
      };
    })
    .sort((a, b) => {
      const aOrder = state[a.key]?.order ?? Number.POSITIVE_INFINITY;
      const bOrder = state[b.key]?.order ?? Number.POSITIVE_INFINITY;
      return aOrder - bOrder;
    });
}

export function mergeColumnSettings(
  current: ColumnSettingItem[],
  next: ColumnSettingItem[],
): ColumnSettingItem[] {
  const currentMap = new Map(current.map((item) => [item.key, item]));
  const nextMap = new Map(next.map((item) => [item.key, item]));
  const merged = current
    .filter((item) => nextMap.has(item.key))
    .map((item) => ({ ...nextMap.get(item.key)!, visible: item.visible }));

  next.forEach((item) => {
    if (!currentMap.has(item.key)) merged.push(item);
  });
  return merged;
}

export function moveColumnSetting(
  columns: ColumnSettingItem[],
  sourceKey: string,
  targetKey: string,
): ColumnSettingItem[] {
  const sourceIndex = columns.findIndex((item) => item.key === sourceKey);
  const targetIndex = columns.findIndex((item) => item.key === targetKey);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return columns;
  }
  const next = [...columns];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function columnSettingsToState(
  settings: ColumnSettingItem[],
): Record<string, CrudTableColumnState> {
  return Object.fromEntries(
    settings.map((item, index) => [
      item.key,
      { show: item.visible, order: index },
    ]),
  );
}

function isDayjsLike(value: unknown): value is {
  format: (template?: string) => string;
  valueOf: () => number;
} {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.format === 'function' &&
    typeof candidate.valueOf === 'function' &&
    (candidate.$isDayjsObject === true || '$d' in candidate)
  );
}

export function normalizeQueryValue(
  value: unknown,
  dateFormatter: 'string' | 'number' | false,
): unknown {
  if (dateFormatter !== false && isDayjsLike(value)) {
    return dateFormatter === 'number'
      ? value.valueOf()
      : value.format('YYYY-MM-DD HH:mm:ss');
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeQueryValue(item, dateFormatter));
  }
  if (value && typeof value === 'object' && !isDayjsLike(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeQueryValue(item, dateFormatter),
      ]),
    );
  }
  return value;
}

export function buildRequestQuery<
  RecordType extends object,
  Query extends CrudTableQuery,
>(
  values: Partial<Query>,
  columns: CrudTableColumn<RecordType, Query>[],
  dateFormatter: 'string' | 'number' | false,
): Query {
  const result: Record<string, unknown> = {};
  Object.entries(values).forEach(([key, rawValue]) => {
    const column = columns.find((item) => item.dataIndex === key);
    const searchConfig =
      column && typeof column.search === 'object' ? column.search : undefined;
    if (searchConfig?.transform) {
      const transformed = searchConfig.transform(rawValue);
      Object.entries(transformed).forEach(([transformedKey, value]) => {
        result[transformedKey] = normalizeQueryValue(value, dateFormatter);
      });
      return;
    }
    result[key] = normalizeQueryValue(rawValue, dateFormatter);
  });
  return result as Query;
}

export function valueEnumToOptions(
  valueEnum: CrudValueEnum | undefined,
): Array<{ label: unknown; value: string | number | boolean; disabled?: boolean }> {
  if (!valueEnum) return [];
  const entries = valueEnum instanceof Map
    ? Array.from(valueEnum.entries())
    : Object.entries(valueEnum);
  return entries.map(([value, item]) => {
    if (
      item &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      'text' in item
    ) {
      return {
        label: item.text,
        value,
        disabled: item.disabled,
      };
    }
    return { label: item, value };
  });
}

export function filterLocalData<
  RecordType extends object,
  Query extends CrudTableQuery,
>(
  data: RecordType[],
  query: Query,
  columns: CrudTableColumn<RecordType, Query>[],
): RecordType[] {
  const activeEntries = Object.entries(query).filter(([, value]) => {
    if (value === undefined || value === null || value === '') return false;
    return !Array.isArray(value) || value.length > 0;
  });
  if (activeEntries.length === 0) return data;

  return data.filter((record) =>
    activeEntries.every(([key, expected]) => {
      const column = columns.find((item) => item.dataIndex === key);
      if (!column?.dataIndex) return true;
      const actual = record[column.dataIndex];
      if (Array.isArray(expected)) {
        return expected.every((item) =>
          String(actual ?? '').includes(String(item ?? '')),
        );
      }
      if (column.valueType === 'select' || column.valueType === 'switch') {
        return String(actual ?? '') === String(expected);
      }
      return String(actual ?? '')
        .toLowerCase()
        .includes(String(expected).toLowerCase());
    }),
  );
}

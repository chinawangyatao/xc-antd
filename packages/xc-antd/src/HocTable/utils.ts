import type {
  HocTableColumn,
  HocTableValidationRule,
} from './types';

export interface HocTableColumnSetting {
  key: string;
  label: string;
  visible: boolean;
  disabled: boolean;
}

/** @deprecated 请使用 HocTableColumnSetting。 */
export type ColumnSetting = HocTableColumnSetting;

export function createHocTableColumnSettings<RecordType extends object>(
  columns: HocTableColumn<RecordType>[],
  showAction: boolean,
  actionTitle: string,
): HocTableColumnSetting[] {
  const settings = columns.map((column) => ({
    key: column.key,
    label: column.title,
    visible: true,
    disabled: column.disableColumnSetting === true,
  }));
  return showAction
    ? [...settings, {
      key: '__action__',
      label: actionTitle,
      visible: true,
      disabled: true,
    }]
    : settings;
}

export function mergeHocTableColumnSettings(
  current: HocTableColumnSetting[],
  next: HocTableColumnSetting[],
): HocTableColumnSetting[] {
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

export function moveHocTableColumnSetting(
  settings: HocTableColumnSetting[],
  sourceKey: string,
  targetKey: string,
): HocTableColumnSetting[] {
  const sourceIndex = settings.findIndex((item) => item.key === sourceKey);
  const targetIndex = settings.findIndex((item) => item.key === targetKey);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return settings;
  }
  const next = [...settings];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function filterHocTableData<RecordType extends object>(
  dataSource: RecordType[],
  columns: HocTableColumn<RecordType>[],
  globalSearch: string,
  columnFilters: Record<string, string>,
): RecordType[] {
  const globalKeyword = globalSearch.trim().toLocaleLowerCase();
  const activeFilters = Object.entries(columnFilters).filter(([, value]) => value !== '');

  return dataSource.filter((record) => {
    const matchesGlobal = !globalKeyword || columns.some((column) =>
      String(record[column.dataIndex] ?? '').toLocaleLowerCase().includes(globalKeyword),
    );
    if (!matchesGlobal) return false;

    return activeFilters.every(([key, filterValue]) => {
      const column = columns.find((item) => item.key === key);
      if (!column) return true;
      const value = String(record[column.dataIndex] ?? '');
      if (column.filterMode === 'select' || column.filterMode === 'switch') {
        return value === filterValue;
      }
      return value.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase());
    });
  });
}

export function validateHocTableRow<RecordType extends object>(
  record: RecordType,
  rules: HocTableValidationRule[],
): Record<string, string> {
  const row = record as Record<string, unknown>;
  const errors: Record<string, string> = {};
  rules.forEach(({ field, label, rule }) => {
    const value = row[field];
    const message = rule
      ? rule(String(value ?? ''))
      : value === undefined || value === null || value === ''
        ? `${label}不能为空`
        : null;
    if (message) errors[field] = message;
  });
  return errors;
}

export function extractHocTableFieldValue(
  value: unknown,
  valueType?: unknown,
): unknown {
  if (value && typeof value === 'object' && 'target' in value) {
    const target = (value as { target?: { value?: unknown } }).target;
    if (target && 'value' in target) return target.value;
  }
  if (
    (valueType === 'date' || valueType === 'dateTime')
    && value
    && typeof value === 'object'
    && 'format' in value
  ) {
    const dateValue = value as { format?: (template: string) => string };
    if (typeof dateValue.format === 'function') {
      return dateValue.format(
        valueType === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss',
      );
    }
  }
  return value;
}

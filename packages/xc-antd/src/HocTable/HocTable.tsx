import React from 'react';
import {
  Button,
  Space,
  Table,
  type TableProps,
} from 'antd';
import { HocTableEditableCell } from './EditableCell';
import { TableFilter } from './TableFilter';
import { HocTableToolbar } from './Toolbar';
import type {
  HocTableColumn,
  HocTableNewRowFieldConfig,
  HocTableOptions,
  HocTableProps,
} from './types';
import {
  createHocTableColumnSettings,
  filterHocTableData,
  mergeHocTableColumnSettings,
  validateHocTableRow,
} from './utils';
import './style.css';

const NEW_ROW_PREFIX = '__xc_hoc_new__';
const DEFAULT_OPTIONS: Required<HocTableOptions> = {
  search: true,
  filter: true,
  setting: true,
  density: true,
};

function getRecord(record: object): Record<string, unknown> {
  return record as Record<string, unknown>;
}

function getAntColumnProps<RecordType extends object>(
  column: HocTableColumn<RecordType>,
) {
  const result = { ...column } as Record<string, unknown>;
  [
    'filterable',
    'filterMode',
    'filterOptions',
    'switchValue',
    'disableColumnSetting',
    'render',
  ].forEach((key) => delete result[key]);
  return result;
}

function HighlightText({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword) return <>{text}</>;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, index) => part.toLocaleLowerCase() === keyword.toLocaleLowerCase()
        ? <mark key={`${part}-${index}`}>{part}</mark>
        : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>)}
    </>
  );
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

export function HocTable<RecordType extends object>({
  columns,
  dataSource = [],
  rowKey = 'id' as keyof RecordType & string,
  enableAdd = true,
  addText = '添加',
  newRowFactory,
  newRowFieldConfig = {},
  validationRules = [],
  onSave,
  actionRender,
  actionTitle = '操作',
  showAction = true,
  toolBarRender,
  options = {},
  defaultSize = 'middle',
  tableProps,
  className,
  style,
}: HocTableProps<RecordType>) {
  const [tableSize, setTableSize] = React.useState(defaultSize);
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [globalSearch, setGlobalSearch] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>({});
  const [newRows, setNewRows] = React.useState<RecordType[]>([]);
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, Record<string, string>>
  >({});
  const [savingKeys, setSavingKeys] = React.useState<Set<string>>(new Set());
  const nextTemporaryId = React.useRef(1);

  const resolvedOptions: Required<HocTableOptions> = options === false
    ? { search: false, filter: false, setting: false, density: false }
    : { ...DEFAULT_OPTIONS, ...options };
  const defaultColumnSettings = React.useMemo(
    () => createHocTableColumnSettings(columns, showAction, actionTitle),
    [actionTitle, columns, showAction],
  );
  const [innerColumnSettings, setInnerColumnSettings] = React.useState(defaultColumnSettings);
  const columnSettings = React.useMemo(
    () => mergeHocTableColumnSettings(innerColumnSettings, defaultColumnSettings),
    [defaultColumnSettings, innerColumnSettings],
  );

  const isNewRow = React.useCallback((record: RecordType) =>
    String(getRecord(record)[rowKey]).startsWith(NEW_ROW_PREFIX), [rowKey]);

  const removeNewRow = React.useCallback((key: string) => {
    setNewRows((current) => current.filter((row) => String(getRecord(row)[rowKey]) !== key));
    setValidationErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, [rowKey]);

  const addNewRow = () => {
    const temporaryKey = `${NEW_ROW_PREFIX}${nextTemporaryId.current}`;
    nextTemporaryId.current += 1;
    setNewRows((current) => [
      ...current,
      { ...newRowFactory?.(), [rowKey]: temporaryKey } as RecordType,
    ]);
  };

  const updateNewRow = React.useCallback((
    record: RecordType,
    field: string,
    value: unknown,
  ) => {
    const key = String(getRecord(record)[rowKey]);
    setNewRows((current) => current.map((row) =>
      String(getRecord(row)[rowKey]) === key
        ? { ...row, [field]: value }
        : row,
    ));
    const nextRecord = { ...record, [field]: value } as RecordType;
    const fieldRule = validationRules.find((rule) => rule.field === field);
    const error = fieldRule
      ? validateHocTableRow(nextRecord, [fieldRule])[field]
      : undefined;
    setValidationErrors((current) => {
      const rowErrors = { ...current[key] };
      if (error) rowErrors[field] = error;
      else delete rowErrors[field];
      return { ...current, [key]: rowErrors };
    });
  }, [rowKey, validationRules]);

  const saveRows = React.useCallback(async (rows: RecordType[]) => {
    const rowErrors = Object.fromEntries(rows.map((row) => [
      String(getRecord(row)[rowKey]),
      validateHocTableRow(row, validationRules),
    ]));
    const hasErrors = Object.values(rowErrors).some((errors) => Object.keys(errors).length > 0);
    setValidationErrors((current) => ({ ...current, ...rowErrors }));
    if (hasErrors) return;

    const keys = rows.map((row) => String(getRecord(row)[rowKey]));
    setSavingKeys((current) => new Set([...current, ...keys]));
    try {
      await onSave?.(rows);
      setNewRows((current) => current.filter((row) =>
        !keys.includes(String(getRecord(row)[rowKey])),
      ));
      setValidationErrors((current) => {
        const next = { ...current };
        keys.forEach((key) => delete next[key]);
        return next;
      });
    } finally {
      setSavingKeys((current) => {
        const next = new Set(current);
        keys.forEach((key) => next.delete(key));
        return next;
      });
    }
  }, [onSave, rowKey, validationRules]);

  const filteredRows = React.useMemo(
    () => filterHocTableData(dataSource, columns, globalSearch, columnFilters),
    [columnFilters, columns, dataSource, globalSearch],
  );
  const displayedRows = React.useMemo(
    () => [...newRows, ...filteredRows],
    [filteredRows, newRows],
  );

  const tableColumns = React.useMemo(() => {
    const dataColumns: NonNullable<TableProps<RecordType>['columns']> = columns.map((column) => {
      const columnFilter = columnFilters[column.key] ?? '';
      const highlightKeyword = columnFilter || globalSearch;
      return {
        ...getAntColumnProps(column),
        key: column.key,
        dataIndex: column.dataIndex,
        title: column.filterable ? (
          <TableFilter
            title={column.title}
            visible={filterVisible}
            filterMode={column.filterMode}
            filterOptions={column.filterOptions}
            switchValue={column.switchValue}
            value={columnFilter}
            onChange={(value) => setColumnFilters((current) => ({
              ...current,
              [column.key]: value,
            }))}
          />
        ) : column.title,
        render: (value: unknown, record: RecordType, index: number) => {
          if (isNewRow(record)) {
            const key = String(getRecord(record)[rowKey]);
            const config = newRowFieldConfig[column.dataIndex]
              ?? { valueType: 'text' } as HocTableNewRowFieldConfig;
            return (
              <HocTableEditableCell
                value={value}
                title={column.title}
                config={config}
                error={validationErrors[key]?.[column.dataIndex]}
                onChange={(nextValue) => updateNewRow(record, column.dataIndex, nextValue)}
              />
            );
          }
          if (column.render) return column.render(value, record, index);
          const text = String(value ?? '');
          return highlightKeyword
            ? <HighlightText text={text} keyword={highlightKeyword} />
            : text;
        },
      };
    });

    const actionColumn: NonNullable<TableProps<RecordType>['columns']>[number] = {
      key: '__action__',
      title: actionTitle,
      fixed: 'right',
      width: 160,
      render: (_value, record) => {
        const key = String(getRecord(record)[rowKey]);
        if (isNewRow(record)) {
          return (
            <Space size={4}>
              <Button
                type="link"
                size="small"
                loading={savingKeys.has(key)}
                onClick={() => void saveRows([record])}
              >
                保存
              </Button>
              <Button type="link" size="small" onClick={() => removeNewRow(key)}>
                取消
              </Button>
            </Space>
          );
        }
        return actionRender?.({
          record,
          isNewRow: false,
          removeNewRow: () => removeNewRow(key),
        }) ?? '-';
      },
    };
    const columnsWithAction = showAction ? [...dataColumns, actionColumn] : dataColumns;
    const columnMap = new Map(columnsWithAction.map((column) => [String(column.key), column]));
    return columnSettings
      .filter((setting) => setting.visible)
      .map((setting) => columnMap.get(setting.key))
      .filter((column): column is NonNullable<typeof column> => Boolean(column));
  }, [
    actionRender,
    actionTitle,
    columnFilters,
    columnSettings,
    columns,
    filterVisible,
    globalSearch,
    isNewRow,
    newRowFieldConfig,
    removeNewRow,
    rowKey,
    saveRows,
    savingKeys,
    showAction,
    updateNewRow,
    validationErrors,
  ]);

  const toolbarExtra = typeof toolBarRender === 'function'
    ? toolBarRender()
    : toolBarRender;
  const showToolbar = enableAdd
    || Boolean(toolbarExtra)
    || Object.values(resolvedOptions).some(Boolean);
  const {
    className: tableClassName,
    ...restTableProps
  } = tableProps ?? {};

  return (
    <div className={joinClassNames('xc-hoc-table', className)} style={style}>
      {showToolbar && (
        <HocTableToolbar
          addText={addText}
          onAdd={enableAdd ? addNewRow : undefined}
          extra={toolbarExtra}
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
          filterVisible={filterVisible}
          onFilterVisibleChange={(visible) => {
            setFilterVisible(visible);
            if (!visible) setColumnFilters({});
          }}
          size={tableSize}
          onSizeChange={setTableSize}
          columnSettings={columnSettings}
          onColumnSettingsChange={setInnerColumnSettings}
          onColumnSettingsReset={() => setInnerColumnSettings(defaultColumnSettings)}
          options={resolvedOptions}
        />
      )}
      <div className="xc-hoc-table__table">
        <Table<RecordType>
          {...restTableProps}
          className={tableClassName}
          rowKey={rowKey}
          columns={tableColumns}
          dataSource={displayedRows}
          size={tableSize}
        />
      </div>
      {newRows.length > 0 && (
        <div className="xc-hoc-table__footer">
          <Button
            type="primary"
            loading={newRows.some((row) =>
              savingKeys.has(String(getRecord(row)[rowKey])),
            )}
            onClick={() => void saveRows(newRows)}
          >
            保存全部
          </Button>
        </div>
      )}
    </div>
  );
}

export default HocTable;

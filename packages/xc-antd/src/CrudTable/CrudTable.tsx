import React from 'react';
import {
  Alert,
  Button,
  Dropdown,
  Form,
  Popover,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import {
  ColumnHeightOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd/es/table';
import type {
  ColumnType,
  FilterValue,
  SorterResult,
  TableRowSelection,
} from 'antd/es/table/interface';
import { TextField } from '../TextField';
import { CrudTableColumnSettings } from './ColumnSettings';
import { CrudTableSearchForm } from './SearchForm';
import type {
  CrudTableAction,
  CrudTableAdaptiveHeightConfig,
  CrudTableColumn,
  CrudTableColumnState,
  CrudTableProps,
  CrudTableQuery,
} from './types';
import {
  buildRequestQuery,
  columnSettingsToState,
  createColumnSettings,
  filterLocalData,
  getCrudColumnKey,
  type ColumnSettingItem,
} from './utils';
import './style.css';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_OPTIONS = {
  reload: true,
  density: true,
  setting: true,
  fullScreen: true,
};

function readPersistedColumnState(
  persistenceKey?: string,
  persistenceType: 'localStorage' | 'sessionStorage' = 'localStorage',
): Record<string, CrudTableColumnState> | undefined {
  if (!persistenceKey || typeof window === 'undefined') return undefined;
  try {
    const value = window[persistenceType].getItem(persistenceKey);
    return value ? JSON.parse(value) as Record<string, CrudTableColumnState> : undefined;
  } catch {
    return undefined;
  }
}

function persistColumnState(
  persistenceKey: string | undefined,
  persistenceType: 'localStorage' | 'sessionStorage' = 'localStorage',
  value: Record<string, CrudTableColumnState>,
) {
  if (!persistenceKey || typeof window === 'undefined') return;
  window[persistenceType].setItem(persistenceKey, JSON.stringify(value));
}

function getDefaultColumnWidth(
  title: React.ReactNode,
  fixed?: ColumnType<object>['fixed'],
) {
  if (fixed) return 180;
  const text = typeof title === 'string' || typeof title === 'number'
    ? String(title)
    : '';
  let width = 0;
  for (const character of text) {
    width += /[\u4e00-\u9fff]/.test(character) ? 14 : 8;
  }
  return Math.max(120, Math.ceil((width + 32) * 1.15));
}

function useAdaptiveTableHeight(
  elementRef: React.RefObject<HTMLDivElement | null>,
  adaptiveHeight: boolean | CrudTableAdaptiveHeightConfig | undefined,
) {
  const [height, setHeight] = React.useState<number>();

  React.useLayoutEffect(() => {
    if (!adaptiveHeight || typeof window === 'undefined') {
      return;
    }
    const config = typeof adaptiveHeight === 'object' ? adaptiveHeight : {};
    const update = () => {
      const element = elementRef.current;
      if (!element) return;
      const available =
        window.innerHeight -
        element.getBoundingClientRect().top -
        (config.offsetBottom ?? 24) -
        118;
      const next = Math.max(config.minHeight ?? 280, Math.floor(available));
      setHeight((previous) => previous === next ? previous : next);
    };
    update();
    const observer = new ResizeObserver(update);
    if (elementRef.current) observer.observe(elementRef.current);
    window.addEventListener('resize', update);
    document.addEventListener('fullscreenchange', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      document.removeEventListener('fullscreenchange', update);
    };
  }, [adaptiveHeight, elementRef]);

  return adaptiveHeight ? height : undefined;
}

function getAntColumnProps<RecordType extends object, Query extends CrudTableQuery>(
  column: CrudTableColumn<RecordType, Query>,
): ColumnType<RecordType> {
  const result = { ...column } as Record<string, unknown>;
  [
    'key',
    'title',
    'dataIndex',
    'valueType',
    'valueEnum',
    'fieldProps',
    'formItemProps',
    'search',
    'hideInSearch',
    'hideInTable',
    'copyable',
    'disableColumnSetting',
    'render',
    'renderFormItem',
  ].forEach((key) => delete result[key]);
  return result as ColumnType<RecordType>;
}

export function CrudTable<
  RecordType extends object,
  Query extends CrudTableQuery = CrudTableQuery,
>(props: CrudTableProps<RecordType, Query>) {
  const {
    columns,
    request,
    dataSource = [],
    params,
    rowKey = 'id' as keyof RecordType & string,
    actionRef,
    search = {},
    toolBarRender,
    rowActions,
    tableAlertRender,
    rowSelection = false,
    rowClickSelection = true,
    onSelectionChange,
    pagination = {},
    columnsState,
    options = {},
    defaultSize = 'middle',
    adaptiveHeight,
    dateFormatter = 'string',
    postData,
    onLoad,
    onRequestError,
    tableProps,
  } = props;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const tableAreaRef = React.useRef<HTMLDivElement>(null);
  const [form] = Form.useForm<Query>();
  const searchConfig = search === false ? undefined : search;
  const initialValues = searchConfig?.initialValues ?? {};
  const [initialQuery] = React.useState(
    () => buildRequestQuery(initialValues, columns, dateFormatter),
  );

  const [query, setQuery] = React.useState<Query>(initialQuery);
  const [current, setCurrent] = React.useState(
    pagination === false ? 1 : pagination.current ?? pagination.defaultCurrent ?? 1,
  );
  const [pageSize, setPageSize] = React.useState(
    pagination === false
      ? DEFAULT_PAGE_SIZE
      : pagination.pageSize ?? pagination.defaultPageSize ?? DEFAULT_PAGE_SIZE,
  );
  const [requestData, setRequestData] = React.useState<RecordType[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [requestError, setRequestError] = React.useState<unknown>();
  const [reloadVersion, setReloadVersion] = React.useState(0);
  const [sorter, setSorter] = React.useState<
    SorterResult<RecordType> | SorterResult<RecordType>[]
  >({});
  const [filters, setFilters] = React.useState<Record<string, FilterValue | null>>({});
  const [tableSize, setTableSize] = React.useState<'large' | 'middle' | 'small'>(
    defaultSize,
  );
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<RecordType[]>([]);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const requestRef = React.useRef(request);
  const paramsRef = React.useRef(params);
  const postDataRef = React.useRef(postData);
  const onLoadRef = React.useRef(onLoad);
  const onRequestErrorRef = React.useRef(onRequestError);
  React.useEffect(() => { requestRef.current = request; }, [request]);
  React.useEffect(() => { paramsRef.current = params; }, [params]);
  React.useEffect(() => { postDataRef.current = postData; }, [postData]);
  React.useEffect(() => { onLoadRef.current = onLoad; }, [onLoad]);
  React.useEffect(() => { onRequestErrorRef.current = onRequestError; }, [onRequestError]);

  const paramsKey = JSON.stringify(params ?? {});

  const columnsWithActions = React.useMemo<CrudTableColumn<RecordType, Query>[]>(() => {
    if (!rowActions || columns.some((column) => column.valueType === 'option')) {
      return columns;
    }
    return [
      ...columns,
      {
        key: '__option__',
        title: '操作',
        valueType: 'option',
        hideInSearch: true,
        fixed: 'right',
        width: 180,
        disableColumnSetting: true,
      },
    ];
  }, [columns, rowActions]);

  const persistedColumnState = React.useMemo(
    () =>
      readPersistedColumnState(
        columnsState?.persistenceKey,
        columnsState?.persistenceType,
      ),
    [columnsState?.persistenceKey, columnsState?.persistenceType],
  );
  const [innerColumnState, setInnerColumnState] = React.useState<
    Record<string, CrudTableColumnState>
  >(
    () => columnsState?.defaultValue ?? persistedColumnState ?? {},
  );
  const columnSettings = React.useMemo(
    () => createColumnSettings(
      columnsWithActions,
      columnsState?.value ?? innerColumnState,
    ),
    [columnsWithActions, columnsState?.value, innerColumnState],
  );

  const updateColumnSettings = React.useCallback((next: ColumnSettingItem[]) => {
    const nextState = columnSettingsToState(next);
    if (!columnsState?.value) setInnerColumnState(nextState);
    columnsState?.onChange?.(nextState);
    persistColumnState(
      columnsState?.persistenceKey,
      columnsState?.persistenceType,
      nextState,
    );
  }, [columnsState]);

  const resetColumnSettings = React.useCallback(() => {
    const reset = createColumnSettings(
      columnsWithActions,
      columnsState?.defaultValue,
    );
    updateColumnSettings(reset);
  }, [columnsWithActions, columnsState?.defaultValue, updateColumnSettings]);

  const clearSelected = React.useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const reload = React.useCallback((resetPageIndex = false) => {
    if (resetPageIndex && current !== 1) {
      setCurrent(1);
      return;
    }
    setReloadVersion((value) => value + 1);
  }, [current]);

  const reset = React.useCallback(() => {
    form.resetFields();
    setQuery(initialQuery);
    setCurrent(1);
    setFilters({});
    setSorter({});
    setReloadVersion((value) => value + 1);
  }, [form, initialQuery]);

  const reloadAndRest = React.useCallback(() => {
    clearSelected();
    reset();
  }, [clearSelected, reset]);

  const action = React.useMemo<CrudTableAction<RecordType, Query>>(() => ({
    reload,
    reloadAndRest,
    reset,
    clearSelected,
    getSelectedRows: () => selectedRows,
    getSearchForm: () => form,
  }), [reload, reloadAndRest, reset, clearSelected, selectedRows, form]);

  React.useImperativeHandle(actionRef, () => action, [action]);

  const requestIdRef = React.useRef(0);
  const executeRequest = React.useCallback(async () => {
    const activeRequest = requestRef.current;
    if (!activeRequest) return;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setRequestError(undefined);
    try {
      const result = await activeRequest(
        {
          ...(paramsRef.current ?? {}),
          ...query,
          current,
          pageSize,
        } as Query & { current: number; pageSize: number },
        sorter,
        filters,
      );
      if (requestId !== requestIdRef.current) return;
      if (result.success === false) throw new Error('数据请求失败');
      const nextData = postDataRef.current
        ? postDataRef.current(result.data ?? [])
        : result.data ?? [];
      setRequestData(nextData);
      setTotal(result.total ?? nextData.length);
      onLoadRef.current?.(nextData);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setRequestError(error);
      setRequestData([]);
      setTotal(0);
      onRequestErrorRef.current?.(error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [current, filters, pageSize, query, sorter]);

  React.useEffect(() => {
    void paramsKey;
    void reloadVersion;
    void executeRequest();
    return () => {
      requestIdRef.current += 1;
    };
  }, [executeRequest, paramsKey, reloadVersion]);

  const localData = React.useMemo(
    () => filterLocalData(dataSource, query, columns),
    [dataSource, query, columns],
  );
  const displayData = request ? requestData : localData;
  const displayTotal = request ? total : localData.length;

  const handleSearch = (values: Query) => {
    setQuery(buildRequestQuery(values, columns, dateFormatter));
    setCurrent(1);
  };

  const handleSearchReset = (values: Query) => {
    setQuery(buildRequestQuery(values, columns, dateFormatter));
    setCurrent(1);
  };

  const getRecordKey = React.useCallback((record: RecordType): React.Key => {
    if (typeof rowKey === 'function') return rowKey(record);
    return record[rowKey] as React.Key;
  }, [rowKey]);

  const selectionConfig = React.useMemo(
    () => rowSelection && rowSelection !== true ? rowSelection : {},
    [rowSelection],
  );
  const mergedRowSelection = React.useMemo<TableRowSelection<RecordType> | undefined>(() => {
    if (!rowSelection) return undefined;
    const isControlled = selectionConfig.selectedRowKeys !== undefined;
    return {
      preserveSelectedRowKeys: true,
      ...selectionConfig,
      selectedRowKeys: isControlled
        ? selectionConfig.selectedRowKeys
        : selectedRowKeys,
      onChange: (keys, rows, info) => {
        if (!isControlled) setSelectedRowKeys(keys);
        setSelectedRows(rows);
        selectionConfig.onChange?.(keys, rows, info);
        onSelectionChange?.(rows);
      },
    };
  }, [onSelectionChange, rowSelection, selectedRowKeys, selectionConfig]);

  const toggleRowSelection = React.useCallback((record: RecordType) => {
    if (!mergedRowSelection) return;
    const key = getRecordKey(record);
    const currentKeys = mergedRowSelection.selectedRowKeys ?? [];
    const selected = currentKeys.includes(key);
    const nextKeys = selected
      ? currentKeys.filter((item) => item !== key)
      : [...currentKeys, key];
    const nextRows = selected
      ? selectedRows.filter((item) => getRecordKey(item) !== key)
      : [...selectedRows, record];
    if (selectionConfig.selectedRowKeys === undefined) setSelectedRowKeys(nextKeys);
    setSelectedRows(nextRows);
    selectionConfig.onChange?.(nextKeys, nextRows, { type: 'single' });
    onSelectionChange?.(nextRows);
  }, [
    getRecordKey,
    mergedRowSelection,
    onSelectionChange,
    selectedRows,
    selectionConfig,
  ]);

  const antdColumns = React.useMemo<ColumnType<RecordType>[]>(() => {
    const columnMap = new Map(
      columnsWithActions.map((column, index) => [
        getCrudColumnKey(column, index),
        column,
      ]),
    );
    return columnSettings
      .filter((setting) => setting.visible)
      .map((setting) => {
        const column = columnMap.get(setting.key)!;
        const {
          key,
          title,
          dataIndex,
          valueType = 'text',
          valueEnum,
          fieldProps,
          copyable,
          render,
        } = column;
        const columnProps = getAntColumnProps(column);
        const result: ColumnType<RecordType> = {
          ...columnProps,
          key: key ?? setting.key,
          title,
          dataIndex,
          width:
            columnProps.width ??
            (valueType === 'option'
              ? 180
              : getDefaultColumnWidth(title, columnProps.fixed)),
          ellipsis: columnProps.ellipsis ?? valueType !== 'option',
          render: (value: unknown, record: RecordType, index: number) => {
            if (valueType === 'option') {
              const optionNode = render
                ? render(value, record, index, action)
                : rowActions?.(record, action);
              return <Space size={4}>{optionNode}</Space>;
            }
            if (valueType === 'index' || valueType === 'indexBorder') {
              return (current - 1) * pageSize + index + 1;
            }
            const defaultNode = (
              <TextField
                mode="read"
                text={value as React.ReactNode}
                valueType={valueType}
                valueEnum={valueEnum as never}
                fieldProps={fieldProps}
              />
            );
            const node = render
              ? render(value, record, index, action)
              : defaultNode;
            if (!copyable) return node;
            return (
              <Typography.Text copyable={{ text: String(value ?? '') }}>
                {node}
              </Typography.Text>
            );
          },
        };
        return result;
      });
  }, [
    action,
    columnSettings,
    columnsWithActions,
    current,
    pageSize,
    rowActions,
  ]);

  const handleTableChange: NonNullable<TableProps<RecordType>['onChange']> = (
    nextPagination,
    nextFilters,
    nextSorter,
    extra,
  ) => {
    const nextPageSize = nextPagination.pageSize ?? pageSize;
    setPageSize(nextPageSize);
    setCurrent(
      nextPageSize !== pageSize ? 1 : nextPagination.current ?? current,
    );
    setFilters(nextFilters);
    setSorter(nextSorter);
    tableProps?.onChange?.(nextPagination, nextFilters, nextSorter, extra);
  };

  const resolvedPagination = pagination === false
    ? false
    : {
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: [10, 20, 50, 100],
        showTotal: (value: number) => `共 ${value} 条`,
        ...pagination,
        current,
        pageSize,
        total: displayTotal,
      };

  React.useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement === rootRef.current);
    };
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);

  const toggleFullScreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await rootRef.current?.requestFullscreen();
    } catch {
      setIsFullScreen(false);
    }
  };

  const adaptiveScrollY = useAdaptiveTableHeight(tableAreaRef, adaptiveHeight);
  const resolvedOptions = options === false
    ? { reload: false, density: false, setting: false, fullScreen: false }
    : { ...DEFAULT_OPTIONS, ...options };
  const toolbar = toolBarRender?.(action, selectedRows);
  const densityItems = [
    { key: 'large', label: '宽松' },
    { key: 'middle', label: '默认' },
    { key: 'small', label: '紧凑' },
  ];

  const originalOnRow = tableProps?.onRow;
  const mergedOnRow: TableProps<RecordType>['onRow'] = (record, index) => {
    const original = originalOnRow?.(record, index) ?? {};
    if (!mergedRowSelection || !rowClickSelection) return original;
    return {
      ...original,
      onClick: (event) => {
        original.onClick?.(event);
        if (event.defaultPrevented) return;
        const target = event.target as HTMLElement;
        if (target.closest('a, button, input, textarea, select, [role="button"]')) {
          return;
        }
        toggleRowSelection(record);
      },
      style: { cursor: 'pointer', ...original.style },
    };
  };

  return (
    <div ref={rootRef} className="xc-crud-table">
      {searchConfig && (
        <CrudTableSearchForm
          columns={columns}
          config={searchConfig}
          form={form}
          loading={loading}
          onSubmit={handleSearch}
          onReset={handleSearchReset}
        />
      )}

      <div className="xc-crud-table__toolbar">
        <div className="xc-crud-table__toolbar-primary">{toolbar}</div>
        <div className="xc-crud-table__toolbar-options">
          <Space size={4}>
            {resolvedOptions.reload && (
              <Tooltip title="刷新">
                <Button
                  aria-label="刷新"
                  icon={<ReloadOutlined spin={loading} />}
                  onClick={() => reload()}
                />
              </Tooltip>
            )}
            {resolvedOptions.density && (
              <Dropdown
                trigger={['click']}
                menu={{
                  items: densityItems,
                  selectable: true,
                  selectedKeys: [tableSize],
                  onClick: ({ key }) =>
                    setTableSize(key as 'large' | 'middle' | 'small'),
                }}
              >
                <Tooltip title="表格密度">
                  <Button aria-label="表格密度" icon={<ColumnHeightOutlined />} />
                </Tooltip>
              </Dropdown>
            )}
            {resolvedOptions.setting && (
              <Popover
                trigger="click"
                placement="bottomRight"
                content={(
                  <CrudTableColumnSettings
                    columns={columnSettings}
                    onChange={updateColumnSettings}
                    onReset={resetColumnSettings}
                  />
                )}
              >
                <Tooltip title="自定义列">
                  <Button aria-label="自定义列" icon={<SettingOutlined />} />
                </Tooltip>
              </Popover>
            )}
            {resolvedOptions.fullScreen && (
              <Tooltip title={isFullScreen ? '退出全屏' : '全屏'}>
                <Button
                  aria-label={isFullScreen ? '退出全屏' : '全屏'}
                  icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  onClick={() => void toggleFullScreen()}
                />
              </Tooltip>
            )}
          </Space>
        </div>
      </div>

      {requestError !== undefined && (
        <Alert
          className="xc-crud-table__alert"
          type="error"
          showIcon
          message="数据加载失败"
          description={requestError instanceof Error ? requestError.message : '请稍后重试'}
          action={<Button size="small" onClick={() => reload()}>重试</Button>}
        />
      )}

      {selectedRows.length > 0 && tableAlertRender !== false && (
        <div className="xc-crud-table__selection-alert">
          <Space>
            <span>已选择 {selectedRows.length} 项</span>
            {tableAlertRender?.(selectedRows)}
          </Space>
          <Button type="link" size="small" onClick={clearSelected}>取消选择</Button>
        </div>
      )}

      <div ref={tableAreaRef} className="xc-crud-table__table">
        <Table<RecordType>
          {...tableProps}
          rowKey={rowKey}
          columns={antdColumns}
          dataSource={displayData}
          loading={loading}
          size={tableSize}
          rowSelection={mergedRowSelection}
          pagination={resolvedPagination}
          onChange={handleTableChange}
          onRow={mergedOnRow}
          scroll={{
            x: 'max-content',
            ...tableProps?.scroll,
            y: tableProps?.scroll?.y ?? adaptiveScrollY,
          }}
        />
      </div>
    </div>
  );
}

export default CrudTable;

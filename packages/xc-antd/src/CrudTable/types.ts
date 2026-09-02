import type React from 'react';
import type { FormInstance } from 'antd';
import type { FormItemProps } from 'antd/es/form/FormItem';
import type {
  ColumnType,
  FilterValue,
  SorterResult,
  TablePaginationConfig,
  TableRowSelection,
} from 'antd/es/table/interface';
import type { TableProps } from 'antd/es/table';
import type { ProFieldValueTypeInput } from '../TextField/utils';

export type CrudTableQuery = object;

export type CrudValueEnumItem =
  | React.ReactNode
  | {
      text: React.ReactNode;
      status?: string;
      color?: string;
      disabled?: boolean;
    };

export type CrudValueEnum =
  | Record<string, CrudValueEnumItem>
  | Map<string | number | boolean, CrudValueEnumItem>;

export interface CrudColumnSearchConfig<Query extends CrudTableQuery> {
  /** Transform a field value into one or more request parameters. */
  transform?: (value: unknown) => Partial<Record<keyof Query, unknown>>;
  /** Lower values are rendered first in the query form. */
  order?: number;
  /** Override the table value type in the query form, for example dateTime -> dateRange. */
  valueType?: ProFieldValueTypeInput;
  fieldProps?: Record<string, unknown>;
  formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name'>;
}

export interface CrudTableColumn<
  RecordType extends object,
  Query extends CrudTableQuery = CrudTableQuery,
> extends Omit<
    ColumnType<RecordType>,
    'children' | 'dataIndex' | 'key' | 'render' | 'title'
  > {
  key?: React.Key;
  title: React.ReactNode;
  dataIndex?: keyof RecordType & string;
  valueType?: ProFieldValueTypeInput | 'option';
  valueEnum?: CrudValueEnum;
  fieldProps?: Record<string, unknown>;
  formItemProps?: Omit<FormItemProps, 'children' | 'label' | 'name'>;
  search?: boolean | CrudColumnSearchConfig<Query>;
  hideInSearch?: boolean;
  hideInTable?: boolean;
  copyable?: boolean;
  /** Keep infrastructure columns visible and fixed in the column settings panel. */
  disableColumnSetting?: boolean;
  render?: (
    value: unknown,
    record: RecordType,
    index: number,
    action: CrudTableAction<RecordType, Query>,
  ) => React.ReactNode;
  renderFormItem?: (props: {
    value?: unknown;
    onChange?: (...args: unknown[]) => void;
    column: CrudTableColumn<RecordType, Query>;
  }) => React.ReactNode;
}

export type CrudTableRequestParams<Query extends CrudTableQuery> = Query & {
  current: number;
  pageSize: number;
};

export interface CrudTableRequestResult<RecordType extends object> {
  data: RecordType[];
  success?: boolean;
  total?: number;
}

export type CrudTableRequest<
  RecordType extends object,
  Query extends CrudTableQuery,
> = (
  params: CrudTableRequestParams<Query>,
  sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
  filter: Record<string, FilterValue | null>,
) => Promise<CrudTableRequestResult<RecordType>>;

export interface CrudTableColumnState {
  show?: boolean;
  order?: number;
}

export interface CrudTableColumnsStateConfig {
  value?: Record<string, CrudTableColumnState>;
  defaultValue?: Record<string, CrudTableColumnState>;
  onChange?: (value: Record<string, CrudTableColumnState>) => void;
  persistenceKey?: string;
  persistenceType?: 'localStorage' | 'sessionStorage';
}

export interface CrudTableSearchConfig<Query extends CrudTableQuery> {
  initialValues?: Partial<Query>;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  defaultColsNumber?: number;
  submitText?: React.ReactNode;
  resetText?: React.ReactNode;
}

export interface CrudTableOptions {
  reload?: boolean;
  density?: boolean;
  setting?: boolean;
  fullScreen?: boolean;
}

export interface CrudTableAdaptiveHeightConfig {
  offsetBottom?: number;
  minHeight?: number;
}

export interface CrudTableAction<
  RecordType extends object,
  Query extends CrudTableQuery,
> {
  reload: (resetPageIndex?: boolean) => void;
  reloadAndRest: () => void;
  reset: () => void;
  clearSelected: () => void;
  getSelectedRows: () => RecordType[];
  getSearchForm: () => FormInstance<Query>;
}

export interface CrudTableProps<
  RecordType extends object,
  Query extends CrudTableQuery = CrudTableQuery,
> {
  columns: CrudTableColumn<RecordType, Query>[];
  request?: CrudTableRequest<RecordType, Query>;
  dataSource?: RecordType[];
  params?: Partial<Query>;
  rowKey?: keyof RecordType & string | ((record: RecordType) => React.Key);
  actionRef?: React.Ref<CrudTableAction<RecordType, Query>>;
  search?: false | CrudTableSearchConfig<Query>;
  headerTitle?: React.ReactNode;
  toolBarRender?: (
    action: CrudTableAction<RecordType, Query>,
    selectedRows: RecordType[],
  ) => React.ReactNode;
  rowActions?: (
    record: RecordType,
    action: CrudTableAction<RecordType, Query>,
  ) => React.ReactNode;
  tableAlertRender?: false | ((selectedRows: RecordType[]) => React.ReactNode);
  rowSelection?: false | true | TableRowSelection<RecordType>;
  /** Toggle checkbox selection when a non-interactive table cell is clicked. */
  rowClickSelection?: boolean;
  onSelectionChange?: (selectedRows: RecordType[]) => void;
  pagination?: false | TablePaginationConfig;
  columnsState?: CrudTableColumnsStateConfig;
  options?: false | CrudTableOptions;
  defaultSize?: 'large' | 'middle' | 'small';
  adaptiveHeight?: boolean | CrudTableAdaptiveHeightConfig;
  dateFormatter?: 'string' | 'number' | false;
  postData?: (data: RecordType[]) => RecordType[];
  onLoad?: (data: RecordType[]) => void;
  onRequestError?: (error: unknown) => void;
  tableProps?: Omit<
    TableProps<RecordType>,
    | 'columns'
    | 'dataSource'
    | 'loading'
    | 'pagination'
    | 'rowKey'
    | 'rowSelection'
    | 'size'
  >;
}

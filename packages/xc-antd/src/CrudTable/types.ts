import type React from 'react';
import type { ColProps, FormInstance, FormProps, RowProps } from 'antd';
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
    /** 自定义查询控件应展开此属性并连接 ref，保留标签、值与校验事件。 */
    controlProps: Record<string, unknown>;
    ref: React.ForwardedRef<unknown>;
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

export interface CrudTableSearchActionsContext<Query extends CrudTableQuery> {
  form: FormInstance<Query>;
  loading: boolean;
  submit: () => void;
  reset: () => void;
}

export interface CrudTableSearchConfig<Query extends CrudTableQuery> {
  initialValues?: Partial<Query>;
  /** 是否默认收起，默认 true。 */
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  /** 收起时保留的字段数；默认展示两行并为按钮留一格，单列布局保留两个字段。 */
  defaultColsNumber?: number;
  /** 原生栅格配置；响应式断点按查询区实际宽度计算。 */
  colProps?: ColProps;
  rowProps?: Omit<RowProps, 'children'>;
  formProps?: Omit<FormProps<Query>, 'children' | 'form' | 'initialValues' | 'onFinish'>;
  /** 默认顺序为展开 / 收起、查询、重置；可按旧项目需要显式指定。 */
  actionOrder?: Array<'collapse' | 'submit' | 'reset'>;
  submitText?: React.ReactNode;
  resetText?: React.ReactNode;
  extraActions?:
    | React.ReactNode
    | ((context: CrudTableSearchActionsContext<Query>) => React.ReactNode);
}

export interface CrudTableOptions {
  /** 刷新、密度、全屏默认隐藏，可显式启用。 */
  reload?: boolean;
  density?: boolean;
  /** 自定义列入口默认显示。 */
  setting?: boolean;
  fullScreen?: boolean;
}

export interface CrudTableAdaptiveHeightConfig {
  /** 默认 viewport 沿用视口测量；container 填满有确定高度的父容器。 */
  mode?: 'viewport' | 'container';
  /** 视口模式底部预留距离，默认 24px。 */
  offsetBottom?: number;
  /** 视口模式表体最小高度，默认 280px。 */
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
  /** 默认 small（紧凑），可使用 middle / large 调整密度。 */
  defaultSize?: 'large' | 'middle' | 'small';
  /** true 按视口适配；mode: 'container' 自动衔接父容器、表体和分页的高度。 */
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
  className?: string;
  style?: React.CSSProperties;
}

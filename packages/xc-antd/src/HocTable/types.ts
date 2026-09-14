import type React from 'react';
import type { TableProps } from 'antd';
import type { ProFieldValueTypeInput } from '../TextField/utils';

export type HocTableFilterMode = 'input' | 'select' | 'date' | 'switch';

export interface HocTableFilterOption {
  label: React.ReactNode;
  value: string | number | boolean;
}

export interface HocTableColumn<RecordType extends object>
  extends Omit<
    NonNullable<TableProps<RecordType>['columns']>[number],
    'children' | 'dataIndex' | 'filterMode' | 'key' | 'render' | 'title'
  > {
  key: string;
  title: string;
  dataIndex: keyof RecordType & string;
  filterable?: boolean;
  filterMode?: HocTableFilterMode;
  filterOptions?: HocTableFilterOption[];
  switchValue?: string | number | boolean;
  disableColumnSetting?: boolean;
  render?: (value: unknown, record: RecordType, index: number) => React.ReactNode;
}

/** @deprecated 请使用 HocTableColumn。 */
export type XcColumnDef<RecordType extends object> = HocTableColumn<RecordType>;

export interface HocTableNewRowFieldConfig {
  valueType: ProFieldValueTypeInput;
  placeholder?: string;
  valueEnum?: Record<string, React.ReactNode | { text: React.ReactNode }>;
  readonly?: boolean;
  fieldProps?: Record<string, unknown>;
}

/** @deprecated 请使用 HocTableNewRowFieldConfig。 */
export type NewRowFieldConfig = HocTableNewRowFieldConfig;

export interface HocTableValidationRule {
  field: string;
  label: string;
  rule?: (value: string) => string | null | undefined;
}

/** @deprecated 请使用 HocTableValidationRule。 */
export type SimpleTableValidationRule = HocTableValidationRule;

export interface HocTableActionRenderContext<RecordType extends object> {
  record: RecordType;
  isNewRow: boolean;
  removeNewRow: () => void;
}

/** @deprecated 请使用 HocTableActionRenderContext。 */
export type ActionRenderContext<RecordType extends object> =
  HocTableActionRenderContext<RecordType>;

export interface HocTableOptions {
  search?: boolean;
  filter?: boolean;
  setting?: boolean;
  density?: boolean;
}

export interface HocTableProps<RecordType extends object> {
  columns: HocTableColumn<RecordType>[];
  dataSource?: RecordType[];
  rowKey?: keyof RecordType & string;
  enableAdd?: boolean;
  addText?: React.ReactNode;
  newRowFactory?: () => Partial<RecordType>;
  newRowFieldConfig?: Partial<Record<keyof RecordType & string, HocTableNewRowFieldConfig>>;
  validationRules?: HocTableValidationRule[];
  onSave?: (rows: RecordType[]) => void | Promise<void>;
  actionRender?: (
    context: HocTableActionRenderContext<RecordType>,
  ) => React.ReactNode;
  actionTitle?: string;
  showAction?: boolean;
  toolBarRender?: React.ReactNode | (() => React.ReactNode);
  options?: false | HocTableOptions;
  defaultSize?: 'large' | 'middle' | 'small';
  tableProps?: Omit<
    TableProps<RecordType>,
    'columns' | 'dataSource' | 'rowKey' | 'size' | 'title' | 'footer'
  >;
  className?: string;
  style?: React.CSSProperties;
}

/** @deprecated 请使用 HocTableProps。 */
export type SimpleTableProps<RecordType extends object> = HocTableProps<RecordType>;

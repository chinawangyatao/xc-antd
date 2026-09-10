export { HocTable, HocTable as SimpleTable, default } from './HocTable';
/** @deprecated 请直接使用 CrudTable。 */
export { CrudTable as CRUDTable } from '../CrudTable';
export {
  TableFilter,
  TableFilterDate,
  TableFilterInput,
  TableFilterSelect,
  TableFilterSwitch,
} from './TableFilter';
export type {
  TableFilterDateProps,
  TableFilterInputProps,
  TableFilterProps,
  TableFilterSelectProps,
  TableFilterSwitchProps,
} from './TableFilter';
export type {
  ActionRenderContext,
  HocTableActionRenderContext,
  HocTableColumn,
  HocTableFilterMode,
  HocTableFilterOption,
  HocTableNewRowFieldConfig,
  HocTableOptions,
  HocTableProps,
  HocTableValidationRule,
  NewRowFieldConfig,
  SimpleTableProps,
  SimpleTableValidationRule,
  XcColumnDef,
} from './types';
export type { ColumnSetting, HocTableColumnSetting } from './utils';

/** @deprecated 请使用 HocTableFilterMode。 */
export type FilterMode = import('./types').HocTableFilterMode;
/** @deprecated 请使用 HocTableFilterOption。 */
export type FilterOption = import('./types').HocTableFilterOption;

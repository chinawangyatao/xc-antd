import SimpleTable from "./table/SimpleTable";
import CRUDTable from "./table/CRUDTable";

export { SimpleTable ,CRUDTable }

export * from './table/index';

// SimpleTable 对外类型
export type {
    SimpleTableProps,
    NewRowFieldConfig,
    SimpleTableValidationRule,
    ActionRenderContext,
} from './table/SimpleTable';

// useXcTable 列定义类型
export type { XcColumnDef } from './table/hooks/useXcTable';

// 表头工具栏类型
export type { ColumnSetting } from './table/component/TableHeaderTool';

// 表头筛选封装组件
export {
    TableFilter,
    TableFilterInput,
    TableFilterSelect,
    TableFilterDate,
    TableFilterSwitch,
} from './table/tableFilter';
export type {
    FilterMode,
    FilterOption,
    TableFilterProps,
    TableFilterInputProps,
    TableFilterSelectProps,
    TableFilterDateProps,
    TableFilterSwitchProps,
} from './table/tableFilter';

// 演示数据（仅供 docs / 示例使用）
export { dataSource as simpleTableDemoData } from './table/data/tableData';

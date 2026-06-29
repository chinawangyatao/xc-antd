import React from 'react';
import { DatePicker, Input, Select, Switch } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css }) => ({
    filterAppear: css`
        margin-top: 8px;
        animation: filterSlideIn 300ms ease-out both;
        @keyframes filterSlideIn {
            from {
                opacity: 0;
                transform: translateY(-8px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `,
}));

/** 筛选模式：input 模糊搜索 | select 下拉精确筛选 | date 日期筛选 | switch 开关筛选 */
export type FilterMode = 'input' | 'select' | 'date' | 'switch';

/** 下拉选项 */
export interface FilterOption {
    label: string;
    value: string;
}

/** ----------------- 子组件 Props ----------------- */

/** Input 模式 props */
export interface TableFilterInputProps {
    /** 列标题 */
    title: string;
    /** 是否展示筛选区域；false 时只渲染标题 */
    visible?: boolean;
    /** 输入框占位文字，默认 `请输入${title}` */
    placeholder?: string;
    /** 当前搜索关键词（受控） */
    searchText?: string;
    /** 搜索关键词变更回调 */
    onSearchChange?: (value: string) => void;
}

/** Select 模式 props */
export interface TableFilterSelectProps {
    /** 列标题 */
    title: string;
    /** 是否展示筛选区域；false 时只渲染标题 */
    visible?: boolean;
    /** 占位文字，默认 `请选择${title}` */
    placeholder?: string;
    /** 下拉可选项 */
    filterOptions?: FilterOption[];
    /** 当前选中值（受控） */
    selectedValue?: string;
    /** 选中值变更回调 */
    onSelectedChange?: (value: string) => void;
}

/** Date 模式 props */
export interface TableFilterDateProps {
    /** 列标题 */
    title: string;
    /** 是否展示筛选区域；false 时只渲染标题 */
    visible?: boolean;
    /** 占位文字，默认 `请选择${title}` */
    placeholder?: string;
    /** 当前选中日期（受控），格式 'YYYY-MM-DD' */
    selectedDate?: string;
    /** 日期变更回调，返回 'YYYY-MM-DD' 格式字符串 */
    onDateChange?: (dateStr: string) => void;
}

/** Switch 模式 props */
export interface TableFilterSwitchProps {
    /** 列标题 */
    title: string;
    /** 是否展示筛选区域；false 时只渲染标题 */
    visible?: boolean;
    /** 开关开启时的匹配值，用于过滤，如 '1'、'true' */
    switchValue?: string;
    /** 当前开关状态（受控） */
    switchChecked?: boolean;
    /** 开关变更回调，ON 时回传 switchValue，OFF 时回传空字符串 */
    onSwitchChange?: (filterValue: string) => void;
}

/** 统一 props，支持 input / select / date / switch 四种模式 */
export interface TableFilterProps extends TableFilterInputProps, TableFilterSelectProps, TableFilterDateProps, TableFilterSwitchProps {
    /** 筛选模式，默认 input */
    filterMode?: FilterMode;
}

/** ----------------- 子组件实现 ----------------- */

/** 仅展示标题（visible=false 或筛选关闭时） */
const FilterTitle: React.FC<{ title: string }> = ({ title }) => <div>{title}</div>;

/** Input 模糊搜索筛选 */
export const TableFilterInput: React.FC<TableFilterInputProps> = (props) => {
    const { styles } = useStyles();
    if (!props.visible) return <FilterTitle title={props.title} />;
    return (
        <>
            <FilterTitle title={props.title} />
            <div className={styles.filterAppear}>
                <Input
                    placeholder={props.placeholder ?? `请输入${props.title}`}
                    value={props.searchText}
                    onChange={(e) => props.onSearchChange?.(e.target.value)}
                    allowClear
                    size="small"
                />
            </div>
        </>
    );
};

/** Select 下拉精确筛选 */
export const TableFilterSelect: React.FC<TableFilterSelectProps> = (props) => {
    const { styles } = useStyles();
    if (!props.visible) return <FilterTitle title={props.title} />;
    return (
        <>
            <FilterTitle title={props.title} />
            <div className={styles.filterAppear}>
                <Select
                    placeholder={props.placeholder ?? `请选择${props.title}`}
                    value={props.selectedValue || undefined}
                    onChange={(val) => props.onSelectedChange?.(val ?? '')}
                    allowClear
                    size="small"
                    style={{ width: '100%' }}
                    options={props.filterOptions}
                />
            </div>
        </>
    );
};

/** Date 日期筛选 */
export const TableFilterDate: React.FC<TableFilterDateProps> = (props) => {
    const { styles } = useStyles();
    if (!props.visible) return <FilterTitle title={props.title} />;
    return (
        <>
            <FilterTitle title={props.title} />
            <div className={styles.filterAppear}>
                <DatePicker
                    placeholder={props.placeholder ?? `请选择${props.title}`}
                    value={props.selectedDate ? dayjs(props.selectedDate) : null}
                    onChange={(date: Dayjs | null) => {
                        const dateStr = date ? date.format('YYYY-MM-DD') : '';
                        props.onDateChange?.(dateStr);
                    }}
                    allowClear
                    size="small"
                    style={{ width: '100%' }}
                />
            </div>
        </>
    );
};

/** Switch 开关筛选 */
export const TableFilterSwitch: React.FC<TableFilterSwitchProps> = (props) => {
    const { styles } = useStyles();
    if (!props.visible) return <FilterTitle title={props.title} />;
    return (
        <>
            <FilterTitle title={props.title} />
            <div className={styles.filterAppear}>
                <Switch
                    checked={props.switchChecked ?? false}
                    onChange={(checked) => {
                        props.onSwitchChange?.(checked ? (props.switchValue ?? '1') : '');
                    }}
                    checkedChildren="是"
                    unCheckedChildren="否"
                    size="small"
                />
            </div>
        </>
    );
};

/**
 * 表头筛选组件
 * - 默认 input 模糊搜索；filterMode='select' 切换为下拉精确筛选
 * - 受控组件，搜索词 / 选中值需由外部维护
 * - 也可通过 `TableFilter.Input` `TableFilter.Select` 直接使用子组件
 *
 * @example
 * // 1. 统一入口，根据 filterMode 切换
 * <TableFilter title="姓名" visible filterMode="input" searchText={s} onSearchChange={setS} />
 *
 * // 2. 直接使用子组件
 * <TableFilter.Select title="状态" visible filterOptions={opts} selectedValue={v} onSelectedChange={setV} />
 */
const TableFilter: React.FC<TableFilterProps> & {
    Input: typeof TableFilterInput;
    Select: typeof TableFilterSelect;
    Date: typeof TableFilterDate;
    Switch: typeof TableFilterSwitch;
} = (props) => {
    const filterMode = props.filterMode ?? 'input';
    if (filterMode === 'select') {
        return (
            <TableFilterSelect
                title={props.title}
                visible={props.visible}
                placeholder={props.placeholder}
                filterOptions={props.filterOptions}
                selectedValue={props.selectedValue}
                onSelectedChange={props.onSelectedChange}
            />
        );
    }
    if (filterMode === 'date') {
        return (
            <TableFilterDate
                title={props.title}
                visible={props.visible}
                placeholder={props.placeholder}
                selectedDate={props.selectedDate}
                onDateChange={props.onDateChange}
            />
        );
    }
    if (filterMode === 'switch') {
        return (
            <TableFilterSwitch
                title={props.title}
                visible={props.visible}
                switchValue={props.switchValue}
                switchChecked={props.switchChecked}
                onSwitchChange={props.onSwitchChange}
            />
        );
    }
    return (
        <TableFilterInput
            title={props.title}
            visible={props.visible}
            placeholder={props.placeholder}
            searchText={props.searchText}
            onSearchChange={props.onSearchChange}
        />
    );
};

TableFilter.Input = TableFilterInput;
TableFilter.Select = TableFilterSelect;
TableFilter.Date = TableFilterDate;
TableFilter.Switch = TableFilterSwitch;

export { TableFilter };
export default TableFilter;

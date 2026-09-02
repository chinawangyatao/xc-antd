import React from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
} from '@tanstack/react-table';
import type { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import TableFilter from '../tableFilter';
import type { FilterMode } from '../tableFilter';

/** 内联高亮组件（避免外部 CJS 依赖的兼容问题） */
const HighlightText: React.FC<{ text: string; keyword: string }> = ({ text, keyword }) => {
    if (!keyword) return <>{text}</>;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === keyword.toLowerCase() ? (
                    <mark key={i} style={{ backgroundColor: '#ffc069', padding: 0 }}>{part}</mark>
                ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                ),
            )}
        </>
    );
};

/** 简化的列定义，用户只需关注业务字段 */
export interface XcColumnDef<T> {
    key: string;
    title: string;
    dataIndex: keyof T & string;
    /** 开启后该列支持搜索过滤 + 文字高亮 */
    filterable?: boolean;
    /** 筛选模式：'input' 模糊搜索（默认） | 'select' 下拉精确筛选 | 'date' 日期筛选 | 'switch' 开关筛选 */
    filterMode?: FilterMode;
    /** select 模式下的选项列表 */
    filterOptions?: { label: string; value: string }[];
    /** switch 模式下的匹配值，开关 ON 时按此值过滤 */
    switchValue?: string;
    /** 自定义渲染（非 filterable 列生效，filterable 列无搜索词时也生效） */
    render?: (text: any, record: T, index: number) => React.ReactNode;
}

interface UseXcTableOptions<T> {
    dataSource: T[];
    columns: XcColumnDef<T>[];
    filterVisible: boolean;
    /** 全局搜索关键词，命中任一列即保留该行 */
    globalSearch?: string;
    /** 列显隐与顺序设置，按顺序输出可见列 */
    columnSettings?: { id: string; visible: boolean }[];
}

/**
 * 基于 TanStack Table 的表格 hook
 * - TanStack Table 管理过滤状态和逻辑
 * - 输出 antd Table 可直接使用的 columns / dataSource
 * - filterable 列自动接入 TableFilter 搜索框 + Highlighter 高亮
 */
export function useXcTable<T extends Record<string, any>>({
    dataSource,
    columns,
    filterVisible,
    globalSearch = '',
    columnSettings,
}: UseXcTableOptions<T>) {
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    /** 获取某列当前的筛选关键词 */
    const getFilterValue = (dataIndex: string): string => {
        const filter = columnFilters.find(f => f.id === dataIndex);
        return (filter?.value as string) ?? '';
    };

    /** 更新某列的筛选关键词 */
    const setFilterValue = React.useCallback((dataIndex: string, value: string) => {
        setColumnFilters(prev => {
            const next = prev.filter(f => f.id !== dataIndex);
            if (value) next.push({ id: dataIndex, value });
            return next;
        });
    }, []);

    /** 清空所有列的筛选 */
    const clearAllFilters = React.useCallback(() => setColumnFilters([]), []);

    // TanStack Table 列定义
    const tanstackColumns = React.useMemo<ColumnDef<T>[]>(
        () => columns.map(col => {
            const isSelect = col.filterable && col.filterMode === 'select';
            const isDate = col.filterable && col.filterMode === 'date';
            const isSwitch = col.filterable && col.filterMode === 'switch';
            let filterFn: any = 'includesString';
            if (isSelect || isSwitch) filterFn = 'equalsString';
            if (isDate) filterFn = 'includesString';
            return {
                accessorKey: col.dataIndex as string,
                header: col.title,
                filterFn,
                enableColumnFilter: !!col.filterable,
            };
        }),
        [columns],
    );

    const table = useReactTable({
        data: dataSource,
        columns: tanstackColumns,
        state: { columnFilters, globalFilter: globalSearch },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: 'includesString',
    });

    // TanStack 过滤后的行 → antd dataSource
    const filteredDataSource = table.getFilteredRowModel().rows.map(row => row.original);

    // 转换为 antd Table 可直接使用的列定义
    const baseAntdColumns = columns.map(col => {
        const columnSearchText = getFilterValue(col.dataIndex as string);
        // 优先用列级搜索词，没有则用全局搜索词高亮
        const highlightKeyword = columnSearchText || globalSearch;
        // 区分高亮来源：列级筛选 vs 全局搜索
        const isColumnFilter = !!columnSearchText;
        const result: Record<string, any> = {
            dataIndex: col.dataIndex,
            key: col.key,
        };

        if (col.filterable) {
            const isSelect = col.filterMode === 'select';
            const isDate = col.filterMode === 'date';
            const isSwitch = col.filterMode === 'switch';
            if (isSelect) {
                result.title = () => (
                    <TableFilter.Select
                        title={col.title}
                        visible={filterVisible}
                        filterOptions={col.filterOptions}
                        selectedValue={columnSearchText}
                        onSelectedChange={(val: string) => setFilterValue(col.dataIndex as string, val)}
                    />
                );
            } else if (isDate) {
                result.title = () => (
                    <TableFilter.Date
                        title={col.title}
                        visible={filterVisible}
                        selectedDate={columnSearchText}
                        onDateChange={(dateStr: string) => setFilterValue(col.dataIndex as string, dateStr)}
                    />
                );
            } else if (isSwitch) {
                result.title = () => (
                    <TableFilter.Switch
                        title={col.title}
                        visible={filterVisible}
                        switchValue={col.switchValue}
                        switchChecked={columnSearchText === (col.switchValue ?? '1')}
                        onSwitchChange={(filterValue: string) => setFilterValue(col.dataIndex as string, filterValue)}
                    />
                );
            } else {
                result.title = () => (
                    <TableFilter.Input
                        title={col.title}
                        visible={filterVisible}
                        placeholder={`请输入${col.title}`}
                        searchText={columnSearchText}
                        onSearchChange={(text: string) => setFilterValue(col.dataIndex as string, text)}
                    />
                );
            }
        } else {
            result.title = col.title;
        }

        result.render = (text: unknown, record: T, index: number) => {
            if (!highlightKeyword) {
                return col.render ? col.render(text, record, index) : String(text ?? '');
            }
            // select 模式 + 列级筛选 → 精确匹配高亮；全局搜索 / input 模式 → substring 高亮
            if (col.filterMode === 'select' && isColumnFilter) {
                return String(text ?? '') === highlightKeyword
                    ? <HighlightText text={String(text ?? '')} keyword={highlightKeyword} />
                    : String(text ?? '');
            }
            return <HighlightText text={String(text ?? '')} keyword={highlightKeyword} />;
        };

        // 操作列等存在自定义 render 的列，未命中关键词时也走原始 render
        if (col.render && !highlightKeyword) {
            result.render = col.render;
        }

        return result;
    });

    // 根据 columnSettings 重排并设置 hidden（使用 antd Table 原生 hidden 字段）
    const antdColumns = (() => {
        if (!columnSettings || columnSettings.length === 0) return baseAntdColumns;
        const idxMap = new Map(columnSettings.map((s, i) => [s.id, i]));
        const visibleMap = new Map(columnSettings.map(s => [s.id, s.visible]));
        return [...baseAntdColumns]
            // 按 columnSettings 顺序重排；未出现在设置中的列排在最后
            .sort((a, b) => {
                const ai = idxMap.get(String(a.key)) ?? Number.POSITIVE_INFINITY;
                const bi = idxMap.get(String(b.key)) ?? Number.POSITIVE_INFINITY;
                return ai - bi;
            })
            // visible=false 的列走 antd 原生 hidden 字段，保留在 columns 中但不渲染
            .map(c => {
                const v = visibleMap.get(String(c.key));
                return v === false ? { ...c, hidden: true } : c;
            });
    })();

    return { table, filteredDataSource, antdColumns, clearAllFilters };
}

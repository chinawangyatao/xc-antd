import React from 'react';
import {Button, Flex, Input, Popover, Radio, Space, Switch} from "antd";
import {PlusCircleFilled,SearchOutlined,FilterOutlined,FunnelPlotOutlined,OrderedListOutlined,HolderOutlined,MinusOutlined,PauseOutlined,MenuOutlined} from "@ant-design/icons";
import {DragDropProvider} from "@dnd-kit/react";
import {useSortable, isSortableOperation} from "@dnd-kit/react/sortable";
import {RestrictToElement} from "@dnd-kit/dom/modifiers";
import {createStyles} from "antd-style";

const useStyles = createStyles(({css}) => ({
    searchWrapper: css`
        overflow: hidden;
        transition: width 300ms ease-in-out;
    `,
    searchOpen: css`
        width: 208px;
    `,
    searchClosed: css`
        width: 0;
    `,
    contentRoot: css`
        width: 256px;
    `,
    header: css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 8px;
        margin-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;
    `,
    headerTitle: css`
        font-size: 14px;
        font-weight: 500;
        color: #4b5563;
    `,
    listContainer: css`
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 288px;
        overflow-y: auto;
        padding-right: 2px;
        margin-top: 12px;
    `,
    footer: css`
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #f3f4f6;
        font-size: 12px;
        color: #9ca3af;
        text-align: right;
    `,
    sortableItem: css`
        height: 32px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 6px;
        border: 1px solid #e5e7eb;
        background: #fff;
        padding: 8px 12px;
        font-size: 14px;
        transition: all 0.2s;
        &:hover {
            border-color: #d1d5db;
        }
    `,
    sortableItemDragging: css`
        z-index: 50;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        opacity: 0.9;
        border-color: #93c5fd;
    `,
    sortableItemHidden: css`
        opacity: 0.5;
    `,
    handle: css`
        cursor: grab;
        color: #d1d5db;
        flex-shrink: 0;
        &:hover {
            color: #6b7280;
        }
        &:active {
            cursor: grabbing;
        }
    `,
    label: css`
        flex: 1;
        user-select: none;
        color: #374151;
    `,
    labelHidden: css`
        text-decoration: line-through;
        color: #9ca3af;
    `,
}));
export const tableHeightTexts = ['large','medium', 'small'] as const;

const SizeIcon: React.FC<{ size: string }> = ({ size }) => {
    if (size === 'large') return <MinusOutlined />;
    if (size === 'medium') return <PauseOutlined style={{ transform: 'rotate(90deg)' }} />;
    return <MenuOutlined />;
};

export interface ColumnSetting {
    id: string;
    label: string;
    visible: boolean;
}

const TableHeaderTool = ({onTableSize,onFilterStatus,filterStatus,globalSearch,onGlobalSearch,columnSettings,onColumnSettingsChange,onAdd}: {
    onTableSize: (size: typeof tableHeightTexts[number]) => void;
    onFilterStatus: (visible: boolean) => void;
    filterStatus: boolean;
    globalSearch?: string;
    onGlobalSearch?: (value: string) => void;
    columnSettings?: ColumnSetting[];
    onColumnSettingsChange?: (next: ColumnSetting[]) => void;
    onAdd?: () => void;
}) => {
    const {styles, cx} = useStyles();
    const [showSearchInput, setShowSearchInput] = React.useState(false);
    const [tableHeight, setTableHeight] = React.useState(0);
    const handleTableHeightClick = () => {
        setTableHeight((prev) => {
            const next = (prev + 1) % tableHeightTexts.length;
            onTableSize(tableHeightTexts[next]);
            return next;
        });
    };
    const handleToggleSearchInput = () => {
        const next = !showSearchInput;
        setShowSearchInput(next);
        // 关闭搜索时清空全局搜索词，恢复完整数据
        if (!next) onGlobalSearch?.('');
    };
    return (
        <>
            <Flex justify="space-between">
                <Button type="primary" icon={<PlusCircleFilled/>} onClick={onAdd}>添加</Button>
                <Space>
                    <div className={cx(styles.searchWrapper, showSearchInput ? styles.searchOpen : styles.searchClosed)}>
                        <Input
                            prefix={<SearchOutlined/>}
                            allowClear
                            placeholder="搜索表格内容"
                            value={globalSearch ?? ''}
                            onChange={e => onGlobalSearch?.(e.target.value)}
                        />
                    </div>
                    <Button type="primary" shape="circle" icon={<SearchOutlined />} onClick={handleToggleSearchInput} />
                    <Button shape="circle" icon={filterStatus ?<FunnelPlotOutlined /> : <FilterOutlined />} onClick={() => onFilterStatus(!filterStatus)}></Button>
                    <Popover arrow={false} content={<Content columns={columnSettings} onColumnsChange={onColumnSettingsChange} />} trigger="click" placement="bottom">
                        <Button shape="circle" icon={<OrderedListOutlined />} />
                    </Popover>
                    <Button shape="circle" onClick={handleTableHeightClick} icon={<SizeIcon size={tableHeightTexts[tableHeight]} />}>

                    </Button>
                </Space>
            </Flex>
        </>
    );
};

export default TableHeaderTool;

const defaultColumns = [
    { id: 'name', label: '名称' },
    { id: 'age', label: '年龄' },
    { id: 'address', label: '地址' },
    { id: 'status', label: '状态' },
    { id: 'action', label: '操作' },
];

function Content({columns: controlledColumns, onColumnsChange}: {
    columns?: ColumnSetting[];
    onColumnsChange?: (next: ColumnSetting[]) => void;
}) {
    const {styles} = useStyles();
    // 内部 fallback state（未受控时使用）
    const [innerColumns, setInnerColumns] = React.useState<ColumnSetting[]>(
        defaultColumns.map(col => ({ ...col, visible: true }))
    );
    const isControlled = !!controlledColumns;
    const columns = isControlled ? controlledColumns! : innerColumns;
    const updateColumns = (updater: (prev: ColumnSetting[]) => ColumnSetting[]) => {
        const next = updater(columns);
        if (isControlled) onColumnsChange?.(next);
        else setInnerColumns(next);
    };

    const containerRef = React.useRef<HTMLDivElement>(null);
    const restrictModifier = RestrictToElement.configure({
        element: () => containerRef.current,
    });

    const allVisible = columns.every(col => col.visible);
    const allHidden = columns.every(col => !col.visible);

    const handleToggleAll = (value: string) => {
        updateColumns(prev => prev.map(col => ({ ...col, visible: value === 'showAll' })));
    };

    const handleToggleItem = (id: string, visible: boolean) => {
        updateColumns(prev => prev.map(col => col.id === id ? { ...col, visible } : col));
    };

    const radioValue = allVisible ? 'showAll' : allHidden ? 'hideAll' : undefined;

    return (
        <div className={styles.contentRoot} ref={containerRef}>
            <div className={styles.header}>
                <span className={styles.headerTitle}>列显示设置</span>
                <Radio.Group
                    value={radioValue}
                    onChange={e => handleToggleAll(e.target.value)}
                    size="small"
                >
                    <Radio.Button value="showAll">全显示</Radio.Button>
                    <Radio.Button value="hideAll">全隐藏</Radio.Button>
                </Radio.Group>
            </div>
            <DragDropProvider
                onDragOver={(event) => {
                    if (!isSortableOperation(event.operation)) return;
                    const { source, target } = event.operation;
                    if (source == null || target == null) return;
                    if (source.id === target.id) return;
                    updateColumns((prev) => {
                        // 不依赖 dnd-kit 的 index（swap 模式下会实时变化），用 id 查找当前数组位置
                        const fromIndex = prev.findIndex(c => c.id === source.id);
                        const toIndex = prev.findIndex(c => c.id === target.id);
                        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
                        const next = [...prev];
                        const [moved] = next.splice(fromIndex, 1);
                        next.splice(toIndex, 0, moved);
                        return next;
                    });
                }}
            >
                <div className={styles.listContainer}>
                    {columns.map((col, index) => (
                        <SortableItem
                            key={col.id}
                            id={col.id}
                            index={index}
                            label={col.label}
                            visible={col.visible}
                            restrictModifier={restrictModifier}
                            onToggle={(visible) => handleToggleItem(col.id, visible)}
                        />
                    ))}
                </div>
            </DragDropProvider>
            <div className={styles.footer}>
                已显示 {columns.filter(c => c.visible).length} / {columns.length} 列
            </div>
        </div>
    );
}

function SortableItem({
    id,
    index,
    label,
    visible,
    restrictModifier,
    onToggle,
}: {
    id: string;
    index: number;
    label: string;
    visible: boolean;
    restrictModifier: ReturnType<typeof RestrictToElement.configure>;
    onToggle: (visible: boolean) => void;
}) {
    const {styles, cx} = useStyles();
    const { ref, isDragging, handleRef } = useSortable({
        id,
        index,
        modifiers: [restrictModifier],
    });

    return (
        <div
            ref={ref}
            className={cx(
                styles.sortableItem,
                isDragging && styles.sortableItemDragging,
                !visible && styles.sortableItemHidden,
            )}
        >
            <span ref={handleRef} className={styles.handle}>
                <HolderOutlined />
            </span>
            <span className={cx(styles.label, !visible && styles.labelHidden)}>
                {label}
            </span>
            <Switch
                checked={visible}
                onChange={onToggle}
                checkedChildren="显"
                unCheckedChildren="隐"
                size="small"
            />
        </div>
    );
}

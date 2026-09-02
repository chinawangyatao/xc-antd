import React from 'react';
import { Button, Space, Table } from 'antd';
import { createStyles } from 'antd-style';
import TableHeaderTool from '../component/TableHeaderTool';
import type { ColumnSetting } from '../component/TableHeaderTool';
import { useXcTable } from '../hooks/useXcTable';
import type { XcColumnDef } from '../hooks/useXcTable';
import { TextField } from '../../../TextField';

const useStyles = createStyles(({ css }) => ({
    footerBar: css`
        display: flex;
        justify-content: center;
        padding: 12px 0;
    `,
    fieldErrorWrap: css`
        display: flex;
        flex-direction: column;
        gap: 2px;
    `,
    fieldErrorText: css`
        color: #ff4d4f;
        font-size: 12px;
        line-height: 1.2;
    `,
    readonlyText: css`
        color: #999;
        font-size: 12px;
    `,
}));

/** 新行临时 ID 前缀 */
const NEW_ROW_PREFIX = '__new_';

/** ----------------- 对外暴露的类型 ----------------- */

/** 行内编辑字段配置 */
export interface NewRowFieldConfig {
    /** TextField 的 valueType：'text' | 'select' | 'date' 等 */
    valueType: string;
    /** 占位文字 */
    placeholder?: string;
    /** valueType='select' 时的枚举映射 */
    valueEnum?: Record<string, { text: string }>;
    /** 只读字段：新增行直接展示 placeholder 文本，不渲染输入框 */
    readonly?: boolean;
}

/** 行内编辑校验规则 */
export interface SimpleTableValidationRule {
    /** 字段名（对应列 dataIndex） */
    field: string;
    /** 字段中文名，用于默认错误提示 */
    label: string;
    /** 自定义校验函数：返回错误信息字符串或 null；不传则视为必填，空值时报 `${label}不能为空` */
    rule?: (value: string) => string | null;
}

/** 操作列渲染上下文 */
export interface ActionRenderContext<T> {
    record: T;
    /** 是否为新增的临时行 */
    isNewRow: boolean;
    /** 移除一行新增数据 */
    removeNewRow: () => void;
}

export interface SimpleTableProps<T extends Record<string, any>> {
    /** 列定义（不含操作列） */
    columns: XcColumnDef<T>[];
    /** 数据源 */
    dataSource: T[];
    /** 行主键字段，默认 'id' */
    rowKey?: keyof T & string;
    /** 是否启用新增行（左上角「添加」按钮 + 行内编辑），默认 true */
    enableAdd?: boolean;
    /** 新增空行工厂：返回除主键外的初始值；不传则使用空对象 */
    newRowFactory?: () => Partial<T>;
    /** 新增行字段编辑配置，按 dataIndex 索引 */
    newRowFieldConfig?: Record<string, NewRowFieldConfig>;
    /** 必填 / 自定义校验规则（仅作用于新增行） */
    validationRules?: SimpleTableValidationRule[];
    /** 保存回调：校验通过后触发；不传则 console.log */
    onSave?: (rows: T[]) => void | Promise<void>;
    /** 自定义已有行的操作列；不传则展示默认「编辑 / 删除」 */
    actionRender?: (ctx: ActionRenderContext<T>) => React.ReactNode;
    /** 操作列标题，默认「操作」 */
    actionTitle?: string;
    /** 是否展示操作列，默认 true */
    showAction?: boolean;
}

/** ----------------- 组件实现 ----------------- */

function SimpleTable<T extends Record<string, any>>(props: SimpleTableProps<T>) {
    const {
        columns: baseColumns,
        dataSource,
        rowKey = 'id' as keyof T & string,
        enableAdd = true,
        newRowFactory,
        newRowFieldConfig = {},
        validationRules = [],
        onSave,
        actionRender,
        actionTitle = '操作',
        showAction = true,
    } = props;

    const { styles } = useStyles();
    const [tableSize, setTableSize] = React.useState<'large' | 'medium' | 'small'>('large');
    const [filterVisible, setFilterVisible] = React.useState(false);
    const [globalSearch, setGlobalSearch] = React.useState('');
    const [columnSettings, setColumnSettings] = React.useState<ColumnSetting[]>(
        () => {
            const cols = baseColumns.map(c => ({ id: c.key, label: c.title, visible: true }));
            return showAction ? [...cols, { id: 'action', label: actionTitle, visible: true }] : cols;
        },
    );

    /** 判断是否新增行 */
    const isNewRow = React.useCallback(
        (record: T): boolean => String(record[rowKey]).startsWith(NEW_ROW_PREFIX),
        [rowKey],
    );

    // ---- 新增行状态 ----
    const [newRows, setNewRows] = React.useState<T[]>([]);
    const nextTempIdRef = React.useRef(1);

    const allData = React.useMemo(() => [...newRows, ...dataSource], [newRows, dataSource]);

    const handleAdd = React.useCallback(() => {
        const tempId = `${NEW_ROW_PREFIX}${nextTempIdRef.current}`;
        nextTempIdRef.current += 1;
        const factoryDefaults = newRowFactory?.() ?? {};
        const newRow = { ...factoryDefaults, [rowKey]: tempId } as T;
        setNewRows(prev => [...prev, newRow]);
    }, [newRowFactory, rowKey]);

    const handleFieldChange = React.useCallback((tempId: string, field: string, value: string) => {
        setNewRows(prev =>
            prev.map(row => (String(row[rowKey]) === tempId ? { ...row, [field]: value } : row)),
        );
    }, [rowKey]);

    // ---- 校验 ----
    /** rowId → fieldName → errorMsg */
    const [validationErrors, setValidationErrors] = React.useState<Record<string, Record<string, string>>>({});

    const handleRemoveNewRow = React.useCallback((tempId: string) => {
        setNewRows(prev => prev.filter(row => String(row[rowKey]) !== tempId));
        setValidationErrors(prev => {
            const next = { ...prev };
            delete next[tempId];
            return next;
        });
    }, [rowKey]);

    /** 校验单字段 */
    const validateField = React.useCallback((field: string, value: string): string | null => {
        const fieldRule = validationRules.find(r => r.field === field);
        if (!fieldRule) return null;
        if (fieldRule.rule) return fieldRule.rule(value);
        if (!value) return `${fieldRule.label}不能为空`;
        return null;
    }, [validationRules]);

    /** 校验整行 */
    const validateRow = React.useCallback((row: T): Record<string, string> => {
        const errors: Record<string, string> = {};
        validationRules.forEach(({ field }) => {
            const value = String(row[field] ?? '');
            const err = validateField(field, value);
            if (err) errors[field] = err;
        });
        return errors;
    }, [validationRules, validateField]);

    /** 单行保存 */
    const validateRowRef = React.useRef(validateRow);
    validateRowRef.current = validateRow;
    const handleSaveSingleRow = React.useCallback(async (row: T) => {
        const rowId = String(row[rowKey]);
        const rowErrors = validateRowRef.current(row);
        if (Object.keys(rowErrors).length > 0) {
            setValidationErrors(prev => ({ ...prev, [rowId]: rowErrors }));
            return;
        }
        if (onSave) await onSave([row]);
        // eslint-disable-next-line no-console
        else console.log('[SimpleTable] 单行保存:', row);
        setNewRows(prev => prev.filter(r => String(r[rowKey]) !== rowId));
        setValidationErrors(prev => {
            const next = { ...prev };
            delete next[rowId];
            return next;
        });
    }, [rowKey, onSave]);

    /** 校验所有新增行，返回是否全部通过 */
    const validateAllRows = React.useCallback((): boolean => {
        let pass = true;
        const allErrors: Record<string, Record<string, string>> = {};
        newRows.forEach(row => {
            const rowErrors = validateRow(row);
            if (Object.keys(rowErrors).length > 0) {
                pass = false;
                allErrors[String(row[rowKey])] = rowErrors;
            }
        });
        setValidationErrors(allErrors);
        return pass;
    }, [newRows, validateRow, rowKey]);

    const handleSave = React.useCallback(async () => {
        if (!validateAllRows()) return;
        if (onSave) await onSave(newRows);
        // eslint-disable-next-line no-console
        else console.log('[SimpleTable] 保存的数据:', newRows);
        setNewRows([]);
        setValidationErrors({});
    }, [newRows, validateAllRows, onSave]);

    /** 统一 TextField onChange 参数 → 字符串 */
    const extractChangeValue = React.useCallback((val: any, valueType: string): string => {
        if (val?.target?.value !== undefined) return val.target.value;
        if (valueType === 'date' && val && typeof val === 'object') {
            return val.format?.('YYYY-MM-DD HH:mm:ss') ?? String(val ?? '');
        }
        return String(val ?? '');
    }, []);

    // ---- 构建带行内编辑 render 的列定义 ----
    const xcColumns = React.useMemo<XcColumnDef<T>[]>(() => {
        const dataCols = baseColumns.map(col => {
            const fieldKey = col.dataIndex as string;
            const config: NewRowFieldConfig = newRowFieldConfig[fieldKey] || { valueType: 'text' };
            return {
                ...col,
                render: (text: any, record: T, index: number) => {
                    if (isNewRow(record)) {
                        if (config.readonly) {
                            return <span className={styles.readonlyText}>{config.placeholder}</span>;
                        }
                        const rowId = String(record[rowKey]);
                        const rowErrors = validationErrors[rowId] || {};
                        const hasError = !!rowErrors[fieldKey];
                        const errorMsg = rowErrors[fieldKey];

                        const commonProps = {
                            mode: 'edit' as const,
                            value: text,
                            onChange: (val: any) => {
                                const value = extractChangeValue(val, config.valueType);
                                handleFieldChange(rowId, fieldKey, value);
                                // 实时校验
                                const err = validateField(fieldKey, value);
                                setValidationErrors(prev => {
                                    const rowErrs = { ...(prev[rowId] || {}) };
                                    if (err) rowErrs[fieldKey] = err;
                                    else delete rowErrs[fieldKey];
                                    if (Object.keys(rowErrs).length === 0) {
                                        const next = { ...prev };
                                        delete next[rowId];
                                        return next;
                                    }
                                    return { ...prev, [rowId]: rowErrs };
                                });
                            },
                            fieldProps: {
                                size: 'small' as const,
                                style: { width: '100%' },
                                ...(hasError ? { status: 'error' as const } : {}),
                            },
                        };

                        const node = (() => {
                            if (config.valueType === 'date') {
                                return (
                                    <TextField
                                        {...commonProps}
                                        valueType="date"
                                        format="YYYY-MM-DD HH:mm:ss"
                                        showTime
                                        placeholder={config.placeholder ?? `请选择${col.title}`}
                                        fieldProps={{ ...commonProps.fieldProps, allowClear: true }}
                                    />
                                );
                            }
                            if (config.valueType === 'select') {
                                return (
                                    <TextField
                                        {...commonProps}
                                        valueType="select"
                                        valueEnum={config.valueEnum}
                                        placeholder={config.placeholder ?? `请选择${col.title}`}
                                        fieldProps={{ ...commonProps.fieldProps, allowClear: true }}
                                    />
                                );
                            }
                            return (
                                <TextField
                                    {...commonProps}
                                    valueType="text"
                                    placeholder={config.placeholder ?? `请输入${col.title}`}
                                />
                            );
                        })();

                        return (
                            <div className={styles.fieldErrorWrap}>
                                {node}
                                {errorMsg && <span className={styles.fieldErrorText}>{errorMsg}</span>}
                            </div>
                        );
                    }
                    // 已有行：优先使用列上的 render，否则展示原文本
                    return col.render ? col.render(text, record, index) : text;
                },
            };
        });

        if (!showAction) return dataCols;

        const actionCol: XcColumnDef<T> = {
            key: 'action',
            title: actionTitle,
            dataIndex: 'action' as any,
            render: (_: any, record: T) => {
                if (isNewRow(record)) {
                    return (
                        <Space>
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => handleSaveSingleRow(record)}
                            >
                                保存
                            </Button>
                            <Button
                                size="small"
                                danger
                                onClick={() => handleRemoveNewRow(String(record[rowKey]))}
                            >
                                删除
                            </Button>
                        </Space>
                    );
                }
                if (actionRender) {
                    return actionRender({
                        record,
                        isNewRow: false,
                        removeNewRow: () => handleRemoveNewRow(String(record[rowKey])),
                    });
                }
                return (
                    <Space>
                        <Button type="primary" size="small">编辑</Button>
                        <Button size="small">删除</Button>
                    </Space>
                );
            },
        };
        return [...dataCols, actionCol];
    }, [
        baseColumns, newRowFieldConfig, isNewRow, rowKey, validationErrors,
        handleFieldChange, extractChangeValue, validateField, handleRemoveNewRow,
        handleSaveSingleRow, actionRender, actionTitle, showAction,
        styles.fieldErrorWrap, styles.fieldErrorText, styles.readonlyText,
    ]);

    const { filteredDataSource, antdColumns, clearAllFilters } = useXcTable<T>({
        dataSource: allData,
        columns: xcColumns,
        filterVisible,
        globalSearch,
        columnSettings,
    });

    React.useEffect(() => {
        if (!filterVisible) clearAllFilters();
    }, [filterVisible, clearAllFilters]);

    const footerContent = React.useMemo(() => {
        if (newRows.length === 0) return null;
        return (
            <div className={styles.footerBar}>
                <Button type="primary" onClick={handleSave}>保存</Button>
            </div>
        );
    }, [newRows.length, handleSave, styles.footerBar]);

    return (
        <Table<T>
            rowKey={rowKey}
            columns={antdColumns}
            dataSource={filteredDataSource}
            styles={{ root: { padding: 20, background: 'white' } }}
            title={() => (
                <TableHeaderTool
                    onTableSize={setTableSize}
                    onFilterStatus={setFilterVisible}
                    filterStatus={filterVisible}
                    globalSearch={globalSearch}
                    onGlobalSearch={setGlobalSearch}
                    columnSettings={columnSettings}
                    onColumnSettingsChange={setColumnSettings}
                    onAdd={enableAdd ? handleAdd : undefined}
                />
            )}
            footer={() => footerContent}
            size={tableSize === 'medium' ? 'middle' : tableSize}
        />
    );
}

export default SimpleTable;

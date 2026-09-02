import { Button, Checkbox, Divider, Switch } from 'antd';
import { HolderOutlined, UndoOutlined } from '@ant-design/icons';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortableOperation, useSortable } from '@dnd-kit/react/sortable';
import type { ColumnSettingItem } from './utils';
import { moveColumnSetting } from './utils';

export interface CrudTableColumnSettingsProps {
  columns: ColumnSettingItem[];
  onChange: (columns: ColumnSettingItem[]) => void;
  onReset: () => void;
}

export function CrudTableColumnSettings({
  columns,
  onChange,
  onReset,
}: CrudTableColumnSettingsProps) {
  const configurableColumns = columns.filter((column) => !column.disabled);
  const allVisible = configurableColumns.every((column) => column.visible);
  const partiallyVisible =
    configurableColumns.some((column) => column.visible) && !allVisible;

  const toggleAll = (checked: boolean) => {
    onChange(
      columns.map((column) =>
        column.disabled ? column : { ...column, visible: checked },
      ),
    );
  };

  return (
    <div className="xc-crud-table__column-settings">
      <div className="xc-crud-table__column-settings-header">
        <Checkbox
          checked={allVisible}
          indeterminate={partiallyVisible}
          onChange={(event) => toggleAll(event.target.checked)}
        >
          列展示
        </Checkbox>
        <Button type="link" size="small" icon={<UndoOutlined />} onClick={onReset}>
          重置
        </Button>
      </div>
      <Divider />
      <DragDropProvider
        onDragOver={(event) => {
          if (!isSortableOperation(event.operation)) return;
          const { source, target } = event.operation;
          if (!source || !target || source.id === target.id) return;
          onChange(moveColumnSetting(columns, String(source.id), String(target.id)));
        }}
      >
        <div className="xc-crud-table__column-settings-list">
          {columns.map((column, index) => (
            <SortableColumnSetting
              key={column.key}
              column={column}
              index={index}
              onVisibleChange={(visible) =>
                onChange(
                  columns.map((item) =>
                    item.key === column.key ? { ...item, visible } : item,
                  ),
                )
              }
            />
          ))}
        </div>
      </DragDropProvider>
      <div className="xc-crud-table__column-settings-footer">
        已显示 {columns.filter((column) => column.visible).length} / {columns.length} 列
      </div>
    </div>
  );
}

function SortableColumnSetting({
  column,
  index,
  onVisibleChange,
}: {
  column: ColumnSettingItem;
  index: number;
  onVisibleChange: (visible: boolean) => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: column.key,
    index,
    disabled: column.disabled,
  });

  return (
    <div
      ref={ref}
      className={`xc-crud-table__column-setting${
        isDragging ? ' xc-crud-table__column-setting--dragging' : ''
      }`}
    >
      <button
        ref={handleRef}
        type="button"
        className="xc-crud-table__drag-handle"
        disabled={column.disabled}
        aria-label={`拖动${column.label}`}
      >
        <HolderOutlined />
      </button>
      <span className="xc-crud-table__column-setting-label">{column.label}</span>
      <Switch
        size="small"
        checked={column.visible}
        disabled={column.disabled}
        onChange={onVisibleChange}
      />
    </div>
  );
}

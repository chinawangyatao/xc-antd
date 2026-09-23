import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';
import type { GroupedSelectGroup, GroupedSelectValue } from './utils';
import { GroupedSelectColorPicker } from './ColorPickerSelect';
import type { GroupedSelectColor } from './utils';

interface EditEditorProps {
  kind: 'group' | 'option';
  groups?: GroupedSelectGroup[];
  groupId?: GroupedSelectValue;
  colorOptions?: GroupedSelectColor[];
  color?: string;
  label: string;
  maxLength?: number;
  saving: boolean;
  error: string;
  onChange: (label: string) => void;
  onGroupChange?: (id: GroupedSelectValue) => void;
  onColorChange?: (color: string | undefined) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function GroupedSelectEditEditor({
  kind,
  groups = [],
  groupId,
  colorOptions = [],
  color,
  label,
  maxLength,
  saving,
  error,
  onChange,
  onGroupChange,
  onColorChange,
  onSave,
  onCancel,
}: EditEditorProps) {
  return (
    <div className="xc-grouped-select__inline-editor">
      {kind === 'option' && onGroupChange && (
        <Select<GroupedSelectValue>
          aria-label="所属分组"
          size="small"
          placeholder="请选择分组"
          value={groups.some((group) => group.id === groupId) ? groupId : undefined}
          options={groups.map((group) => ({ value: group.id, label: group.label }))}
          onChange={onGroupChange}
          getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
          className="xc-grouped-select__edit-group-picker"
        />
      )}
      {kind === 'option' && colorOptions.length > 0 && onColorChange && (
        <GroupedSelectColorPicker
          colors={colorOptions}
          value={color}
          size="small"
          onChange={onColorChange}
        />
      )}
      <Input
        autoFocus
        size="small"
        aria-label={kind === 'group' ? '编辑分组名称' : '编辑标签名称'}
        value={label}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        onPressEnter={onSave}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            if (!saving) onCancel();
          }
        }}
      />
      <Button
        size="small"
        type="primary"
        aria-label="保存编辑"
        icon={<CheckOutlined />}
        loading={saving}
        disabled={!label.trim()}
        onClick={onSave}
      />
      <Button
        size="small"
        aria-label="取消编辑"
        icon={<CloseOutlined />}
        disabled={saving}
        onClick={onCancel}
      />
      {error && <span role="alert" className="xc-grouped-select__error">{error}</span>}
    </div>
  );
}

import { Button, Input, Select } from 'antd';
import type { GroupedSelectGroup, GroupedSelectValue } from './utils';

interface AddEditorProps {
  mode: 'group' | 'option';
  groups: GroupedSelectGroup[];
  label: string;
  groupId?: GroupedSelectValue;
  adding: boolean;
  error: string;
  onLabelChange: (label: string) => void;
  onGroupChange: (id: GroupedSelectValue) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function GroupedSelectAddEditor({
  mode,
  groups,
  label,
  groupId,
  adding,
  error,
  onLabelChange,
  onGroupChange,
  onSubmit,
  onCancel,
}: AddEditorProps) {
  return (
    <div className="xc-grouped-select__editor">
      {mode === 'option' && (
        <Select<GroupedSelectValue>
          aria-label="所属分组"
          placeholder="请选择分组"
          value={groups.some((group) => group.id === groupId) ? groupId : undefined}
          options={groups.map((group) => ({ value: group.id, label: group.label }))}
          onChange={onGroupChange}
          getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
          className="xc-grouped-select__group-picker"
        />
      )}
      <Input
        autoFocus
        aria-label={mode === 'group' ? '新分组名称' : '新标签名称'}
        placeholder={mode === 'group' ? '请输入分组名称' : '请输入标签名称'}
        value={label}
        onChange={(event) => onLabelChange(event.target.value)}
        onPressEnter={onSubmit}
      />
      <div className="xc-grouped-select__editor-actions">
        <Button type="primary" loading={adding}
          disabled={!label.trim() || (mode === 'option'
            && !groups.some((group) => group.id === groupId))}
          onClick={onSubmit}>确定</Button>
        <Button disabled={adding} onClick={onCancel}>取消</Button>
      </div>
      {error && <div role="alert" className="xc-grouped-select__error">{error}</div>}
    </div>
  );
}

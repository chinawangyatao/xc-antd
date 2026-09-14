import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';

interface EditEditorProps {
  kind: 'group' | 'option';
  label: string;
  saving: boolean;
  error: string;
  onChange: (label: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function GroupedSelectEditEditor({
  kind,
  label,
  saving,
  error,
  onChange,
  onSave,
  onCancel,
}: EditEditorProps) {
  return (
    <div className="xc-grouped-select__inline-editor">
      <Input
        autoFocus
        size="small"
        aria-label={kind === 'group' ? '编辑分组名称' : '编辑标签名称'}
        value={label}
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

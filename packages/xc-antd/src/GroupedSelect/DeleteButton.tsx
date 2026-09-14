import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import type { ListDeleteConfirmOptions } from '../shared/listDeleteConfirm';

interface DeleteButtonProps {
  label: string;
  confirm?: ListDeleteConfirmOptions;
  onDelete: () => void | Promise<void>;
}

export function GroupedSelectDeleteButton({ label, confirm, onDelete }: DeleteButtonProps) {
  const button = (
    <Button
      type="text"
      size="small"
      danger
      aria-label={`删除${label}`}
      icon={<DeleteOutlined />}
      onClick={confirm === false ? () => void onDelete() : undefined}
    />
  );

  if (confirm === false) return button;

  const config = typeof confirm === 'object' ? confirm : {};
  return (
    <Popconfirm
      title={config.title ?? `确认删除${label}吗？`}
      description={config.content ?? '删除后无法恢复，请谨慎操作。'}
      okText={config.okText ?? '确认删除'}
      cancelText={config.cancelText ?? '取消'}
      okButtonProps={{ danger: true }}
      onConfirm={onDelete}
      getPopupContainer={(trigger) =>
        trigger.closest<HTMLElement>('.xc-grouped-select__popup') ?? document.body}
    >
      {button}
    </Popconfirm>
  );
}

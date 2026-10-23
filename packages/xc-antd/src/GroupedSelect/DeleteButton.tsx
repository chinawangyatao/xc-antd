import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import type { ListDeleteConfirmOptions } from '../shared/listDeleteConfirm';
import { getMaskLayerPopupProps } from '../shared/popupContainer';

interface DeleteButtonProps {
  label: string;
  confirm?: ListDeleteConfirmOptions;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDelete: () => void | Promise<void>;
}

export function GroupedSelectDeleteButton({ label, confirm, open, onOpenChange, onDelete }: DeleteButtonProps) {
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
      {...getMaskLayerPopupProps()}
      {...(open !== undefined ? { open } : {})}
      onOpenChange={onOpenChange}
      title={config.title ?? `确认删除${label}吗？`}
      description={config.content ?? '删除后无法恢复，请谨慎操作。'}
      okText={config.okText ?? '确认删除'}
      cancelText={config.cancelText ?? '取消'}
      okButtonProps={{ danger: true }}
      onConfirm={onDelete}
    >
      {button}
    </Popconfirm>
  );
}

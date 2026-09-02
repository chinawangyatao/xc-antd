import { Modal } from 'antd';
import type { ModalProps } from 'antd';
import {
  ActionOverlayFooter,
  type ActionOverlayCommonProps,
  useActionOverlay,
} from './shared';

export interface ActionModalProps
  extends Omit<ModalProps, 'footer' | 'onCancel' | 'onOk'>,
    ActionOverlayCommonProps {}

export function ActionModal({
  confirmText,
  cancelText,
  showConfirm,
  showCancel,
  confirmLoading,
  confirmButtonProps,
  cancelButtonProps,
  footer,
  onConfirm,
  onCancel,
  onOpenChange,
  destroyOnHidden = true,
  mask,
  width = 520,
  ...modalProps
}: ActionModalProps) {
  const action = useActionOverlay({
    confirmLoading,
    onConfirm,
    onCancel,
    onOpenChange,
  });
  const footerNode = footer === false ? null : footer ?? (
    <ActionOverlayFooter
      confirmText={confirmText}
      cancelText={cancelText}
      showConfirm={showConfirm}
      showCancel={showCancel}
      confirmLoading={action.loading}
      confirmButtonProps={confirmButtonProps}
      cancelButtonProps={cancelButtonProps}
      onConfirm={action.confirm}
      onCancel={action.cancel}
    />
  );

  return (
    <Modal
      {...modalProps}
      width={width}
      mask={mask ?? { closable: false }}
      destroyOnHidden={destroyOnHidden}
      footer={footerNode}
      onCancel={action.cancel}
    />
  );
}

export default ActionModal;

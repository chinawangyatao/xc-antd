import { Modal } from 'antd';
import type { ModalProps } from 'antd';
import {
  ActionOverlayFooter,
  type ActionOverlayCommonProps,
  UnsavedChangesPrompt,
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
  form,
  hasUnsavedChanges,
  unsavedChangesPrompt,
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
    form,
    hasUnsavedChanges,
    unsavedChangesPrompt,
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
      onCancel={action.requestClose}
    />
  );

  return (
    <>
      <Modal
        {...modalProps}
        width={width}
        mask={mask ?? { closable: true }}
        destroyOnHidden={destroyOnHidden}
        footer={footerNode}
        onCancel={action.requestClose}
      />
      <UnsavedChangesPrompt
        open={action.unsavedPromptOpen}
        config={unsavedChangesPrompt || undefined}
        zIndex={(modalProps.zIndex ?? 1000) + 10}
        onDiscard={action.discardChanges}
        onContinue={action.continueEditing}
      />
    </>
  );
}

export default ActionModal;

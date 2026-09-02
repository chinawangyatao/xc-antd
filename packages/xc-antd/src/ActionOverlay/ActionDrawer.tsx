import { Drawer } from 'antd';
import type { DrawerProps } from 'antd';
import {
  ActionOverlayFooter,
  type ActionOverlayCommonProps,
  UnsavedChangesPrompt,
  useActionOverlay,
} from './shared';

export interface ActionDrawerProps
  extends Omit<DrawerProps, 'footer' | 'onClose'>,
    ActionOverlayCommonProps {}

export function ActionDrawer({
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
  size = 720,
  ...drawerProps
}: ActionDrawerProps) {
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
      <Drawer
        {...drawerProps}
        size={size}
        mask={mask ?? { closable: true }}
        destroyOnHidden={destroyOnHidden}
        footer={footerNode}
        onClose={action.requestClose}
      />
      <UnsavedChangesPrompt
        open={action.unsavedPromptOpen}
        config={unsavedChangesPrompt || undefined}
        zIndex={(drawerProps.zIndex ?? 1000) + 10}
        onDiscard={action.discardChanges}
        onContinue={action.continueEditing}
      />
    </>
  );
}

export default ActionDrawer;

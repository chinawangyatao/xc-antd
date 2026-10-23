import { Drawer } from 'antd';
import type { DrawerProps } from 'antd';
import { useDrawerClosable } from '../shared/useDrawerClosable';
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
  footerLayout = 'drawer',
  onConfirm,
  onCancel,
  onOpenChange,
  form,
  hasUnsavedChanges,
  unsavedChangesPrompt,
  destroyOnHidden = true,
  closable,
  size = 720,
  ...drawerProps
}: ActionDrawerProps) {
  const mergedClosable = useDrawerClosable(closable);
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
      layout={footerLayout}
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
        closable={mergedClosable}
        destroyOnHidden={destroyOnHidden}
        footer={footerNode}
        onClose={action.requestClose}
      />
      <UnsavedChangesPrompt
        open={action.unsavedPromptOpen}
        config={unsavedChangesPrompt || undefined}
        getContainer={drawerProps.getContainer}
        zIndex={(drawerProps.zIndex ?? 1000) + 10}
        onDiscard={action.discardChanges}
        onContinue={action.continueEditing}
      />
    </>
  );
}

export default ActionDrawer;

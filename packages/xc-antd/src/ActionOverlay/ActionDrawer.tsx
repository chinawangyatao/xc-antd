import { Drawer } from 'antd';
import type { DrawerProps } from 'antd';
import {
  ActionOverlayFooter,
  type ActionOverlayCommonProps,
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
    <Drawer
      {...drawerProps}
      size={size}
      mask={mask ?? { closable: false }}
      destroyOnHidden={destroyOnHidden}
      footer={footerNode}
      onClose={action.cancel}
    />
  );
}

export default ActionDrawer;

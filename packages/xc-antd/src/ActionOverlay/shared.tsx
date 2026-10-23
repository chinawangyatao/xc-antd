import { Button, Flex, Modal, theme } from 'antd';
import type { ButtonProps, DrawerProps, FormInstance, ModalProps } from 'antd';
import React from 'react';

export type ActionConfirmResult = boolean | void | Promise<boolean | void>;

export interface UnsavedChangesPromptConfig {
  title?: React.ReactNode;
  content?: React.ReactNode;
  confirmText?: React.ReactNode;
  cancelText?: React.ReactNode;
}

export interface ActionOverlayCommonProps {
  confirmText?: React.ReactNode;
  cancelText?: React.ReactNode;
  showConfirm?: boolean;
  showCancel?: boolean;
  confirmLoading?: boolean;
  confirmButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  footer?: React.ReactNode | false;
  /** 默认按浮层类型排布；modal 为右对齐取消在前，drawer 为左对齐确认在前。 */
  footerLayout?: 'modal' | 'drawer';
  onConfirm?: () => ActionConfirmResult;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
  form?: Pick<FormInstance, 'isFieldsTouched'>;
  hasUnsavedChanges?: boolean | (() => boolean);
  unsavedChangesPrompt?: false | UnsavedChangesPromptConfig;
}

export function resolveUnsavedChanges({
  form,
  hasUnsavedChanges,
}: Pick<ActionOverlayCommonProps, 'form' | 'hasUnsavedChanges'>): boolean {
  if (typeof hasUnsavedChanges === 'function') return hasUnsavedChanges();
  if (hasUnsavedChanges !== undefined) return hasUnsavedChanges;
  return form?.isFieldsTouched() ?? false;
}

export function useActionOverlay({
  confirmLoading,
  onConfirm,
  onCancel,
  onOpenChange,
  form,
  hasUnsavedChanges,
  unsavedChangesPrompt,
}: Pick<
  ActionOverlayCommonProps,
  | 'confirmLoading'
  | 'form'
  | 'hasUnsavedChanges'
  | 'onConfirm'
  | 'onCancel'
  | 'onOpenChange'
  | 'unsavedChangesPrompt'
>) {
  const [innerLoading, setInnerLoading] = React.useState(false);
  const [unsavedPromptOpen, setUnsavedPromptOpen] = React.useState(false);

  const close = () => onOpenChange?.(false);
  const cancelImmediately = () => {
    onCancel?.();
    close();
  };
  const requestClose = () => {
    const shouldPrompt = unsavedChangesPrompt !== false && resolveUnsavedChanges({
      form,
      hasUnsavedChanges,
    });
    if (shouldPrompt) {
      setUnsavedPromptOpen(true);
      return;
    }
    cancelImmediately();
  };
  const discardChanges = () => {
    setUnsavedPromptOpen(false);
    cancelImmediately();
  };
  const confirm = async () => {
    setInnerLoading(true);
    try {
      const result = await onConfirm?.();
      if (result !== false) close();
    } catch {
      // Validation and request errors keep the overlay open for correction.
    } finally {
      setInnerLoading(false);
    }
  };

  return {
    confirm,
    continueEditing: () => setUnsavedPromptOpen(false),
    discardChanges,
    loading: confirmLoading ?? innerLoading,
    requestClose,
    unsavedPromptOpen,
  };
}

export function UnsavedChangesPrompt({
  open,
  config,
  zIndex,
  getContainer,
  onDiscard,
  onContinue,
}: {
  open: boolean;
  config?: UnsavedChangesPromptConfig;
  zIndex?: number;
  getContainer?: DrawerProps['getContainer'] | ModalProps['getContainer'];
  onDiscard: () => void;
  onContinue: () => void;
}) {
  return (
    <Modal
      title={config?.title ?? '未保存提示'}
      open={open}
      width={480}
      zIndex={zIndex}
      // 两者底层均为 Portal；Drawer 的容器类型比 Modal 多允许普通 Element。
      getContainer={getContainer as ModalProps['getContainer']}
      closable={false}
      keyboard={false}
      mask={{ closable: false }}
      destroyOnHidden
      onCancel={onContinue}
      footer={(
        <ActionOverlayFooter
          layout="modal"
          confirmText={config?.confirmText ?? '退出'}
          cancelText={config?.cancelText ?? '继续编辑'}
          confirmButtonProps={{ danger: true }}
          onConfirm={onDiscard}
          onCancel={onContinue}
        />
      )}
    >
      {config?.content ?? '当前内容尚未保存，是否确认退出？退出后未保存内容将丢失。'}
    </Modal>
  );
}

export function ActionOverlayFooter({
  layout = 'drawer',
  confirmText = '确定',
  cancelText = '取消',
  showConfirm = true,
  showCancel = true,
  confirmLoading,
  confirmButtonProps,
  cancelButtonProps,
  onConfirm,
  onCancel,
}: Omit<ActionOverlayCommonProps, 'footer' | 'onOpenChange'> & {
  layout?: 'modal' | 'drawer';
}) {
  const { token } = theme.useToken();
  const confirmButton = showConfirm && (
    <Button
      key="confirm"
      {...confirmButtonProps}
      type="primary"
      loading={confirmLoading}
      onClick={() => void onConfirm?.()}
    >
      {confirmText}
    </Button>
  );
  const cancelButton = showCancel && (
    <Button key="cancel" {...cancelButtonProps} onClick={onCancel}>
      {cancelText}
    </Button>
  );
  return (
    <Flex
      className="xc-action-overlay__footer"
      justify={layout === 'modal' ? 'flex-end' : 'flex-start'}
      align="center"
      gap={token.marginXS}
      wrap
    >
      {layout === 'modal' ? [cancelButton, confirmButton] : [confirmButton, cancelButton]}
    </Flex>
  );
}

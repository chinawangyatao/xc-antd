import { Button, Modal } from 'antd';
import type { ButtonProps, FormInstance } from 'antd';
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
  onDiscard,
  onContinue,
}: {
  open: boolean;
  config?: UnsavedChangesPromptConfig;
  zIndex?: number;
  onDiscard: () => void;
  onContinue: () => void;
}) {
  return (
    <Modal
      title={config?.title ?? '未保存提示'}
      open={open}
      width={420}
      zIndex={zIndex}
      closable={false}
      keyboard={false}
      mask={{ closable: false }}
      destroyOnHidden
      onCancel={onContinue}
      footer={(
        <ActionOverlayFooter
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
  confirmText = '确定',
  cancelText = '取消',
  showConfirm = true,
  showCancel = true,
  confirmLoading,
  confirmButtonProps,
  cancelButtonProps,
  onConfirm,
  onCancel,
}: Omit<ActionOverlayCommonProps, 'footer' | 'onOpenChange'>) {
  return (
    <div className="xc-action-overlay__footer">
      {showConfirm && (
        <Button
          {...confirmButtonProps}
          type="primary"
          loading={confirmLoading}
          onClick={() => void onConfirm?.()}
          style={{ minWidth: 88, ...confirmButtonProps?.style }}
        >
          {confirmText}
        </Button>
      )}
      {showCancel && (
        <Button {...cancelButtonProps} onClick={onCancel}>
          {cancelText}
        </Button>
      )}
    </div>
  );
}

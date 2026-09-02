import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import React from 'react';

export type ActionConfirmResult = boolean | void | Promise<boolean | void>;

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
}

export function useActionOverlay({
  confirmLoading,
  onConfirm,
  onCancel,
  onOpenChange,
}: Pick<
  ActionOverlayCommonProps,
  'confirmLoading' | 'onConfirm' | 'onCancel' | 'onOpenChange'
>) {
  const [innerLoading, setInnerLoading] = React.useState(false);

  const close = () => onOpenChange?.(false);
  const cancel = () => {
    onCancel?.();
    close();
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
    cancel,
    confirm,
    loading: confirmLoading ?? innerLoading,
  };
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

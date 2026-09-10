import { Modal } from 'antd';
import type { ReactNode } from 'react';

export interface ListDeleteConfirmConfig {
  title?: ReactNode;
  content?: ReactNode;
  okText?: ReactNode;
  cancelText?: ReactNode;
}

/** false 表示跳过二次确认；true 或不传时使用默认文案。 */
export type ListDeleteConfirmOptions = boolean | ListDeleteConfirmConfig;

interface DeleteConfirmDefaults {
  title: ReactNode;
  content: ReactNode;
}

export function useListDeleteConfirm(defaults: DeleteConfirmDefaults) {
  const [modal, contextHolder] = Modal.useModal();

  const confirmDelete = (
    options: ListDeleteConfirmOptions | undefined,
    onConfirm: () => void | Promise<void>,
  ) => {
    if (options === false) {
      void onConfirm();
      return;
    }

    const customConfig = typeof options === 'object' ? options : {};
    modal.confirm({
      title: defaults.title,
      content: defaults.content,
      okText: '确认删除',
      cancelText: '取消',
      ...customConfig,
      okButtonProps: { danger: true },
      onOk: onConfirm,
    });
  };

  return { confirmDelete, contextHolder };
}

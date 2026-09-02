import { Input } from 'antd';
import React from 'react';
import type { ProFieldFC } from '../../types';

type Props = Parameters<
  ProFieldFC<{
    text: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>
>[0] & {
  intl?: any;
};

export function FieldPasswordEdit(props: Props, ref: React.Ref<unknown>) {
  const { text, mode, formItemRender, fieldProps } = props;
  const dom = (
    <Input.Password
      placeholder={'请输入'}
      ref={ref as React.Ref<any>}
      {...fieldProps}
    />
  );
  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom);
  }
  return dom;
}

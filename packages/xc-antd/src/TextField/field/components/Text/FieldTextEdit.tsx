import { Input } from 'antd';
import React from 'react';
import type { ProFieldFC } from '../../types';

type FieldTextEditProps = Parameters<
  ProFieldFC<{ text: string; emptyText?: React.ReactNode }>
>[0] & {
  inputRef: React.RefObject<HTMLInputElement | null>;
  intl?: any;
};

export function FieldTextEdit(props: FieldTextEditProps) {
  const { text, mode, formItemRender, fieldProps, inputRef, intl } = props;
  const placeholder = '请输入';
  const dom = (
    <Input
      ref={inputRef}
      placeholder={placeholder}
      allowClear
      {...fieldProps}
    />
  );

  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom);
  }
  return dom;
}

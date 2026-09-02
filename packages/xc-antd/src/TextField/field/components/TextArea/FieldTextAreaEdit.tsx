import { Input } from 'antd';
import React from 'react';
import type { ProFieldFC } from '../../types';

type Props = Parameters<ProFieldFC<{ text: string }>>[0] & {
  intl?: any;
};

export function FieldTextAreaEdit(props: Props, ref: React.Ref<unknown>) {
  const { text, mode, formItemRender, fieldProps } = props;
  const dom = (
    <Input.TextArea
      ref={ref as React.Ref<any>}
      rows={3}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.stopPropagation();
        }
      }}
      placeholder={'请输入'}
      {...fieldProps}
    />
  );
  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom);
  }
  return dom;
}

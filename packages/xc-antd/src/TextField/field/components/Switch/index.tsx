import type { SwitchProps } from 'antd';
import React, { useMemo } from 'react';
import {
  isProFieldEditOrUpdateMode,
  isProFieldReadMode,
} from '../../internal/fieldMode';
import type { ProFieldFC } from '../../types';
import { FieldSwitchEdit } from './FieldSwitchEdit';
import { FieldSwitchLightEdit } from './FieldSwitchLightEdit';
import { FieldSwitchRead } from './FieldSwitchRead';

/**
 * 开关组件
 */
const FieldSwitch: ProFieldFC<{
  text: boolean;
  fieldProps?: SwitchProps;
  variant?: 'outlined' | 'borderless' | 'filled';
}> = (
  {
    text,
    mode,
    render,
    light,
    label,
    formItemRender,
    fieldProps,
    variant: propsVariant,
  },
  ref,
) => {
  
  const variant = propsVariant ?? fieldProps?.variant;
  const readLabel = useMemo(() => {
    if (text === undefined || text === null || `${text}`.length < 1) return '-';
    return text
      ? (fieldProps?.checkedChildren ?? '打开')
      : (fieldProps?.unCheckedChildren ??
          '关闭');
  }, [fieldProps?.checkedChildren, fieldProps?.unCheckedChildren, text]);

  if (isProFieldReadMode(mode)) {
    return (
      <FieldSwitchRead
        text={text}
        mode={mode}
        render={render}
        formItemRender={formItemRender}
        fieldProps={fieldProps}
        light={light}
        label={label}
        readLabel={readLabel}
      />
    );
  }
  if (isProFieldEditOrUpdateMode(mode)) {
    const editProps = {
      text,
      mode,
      render,
      label,
      formItemRender,
      fieldProps,
      variant,
    };
    if (light) {
      return FieldSwitchLightEdit(editProps, ref);
    }
    return FieldSwitchEdit(editProps, ref);
  }
  return null;
};

export default React.forwardRef(FieldSwitch);

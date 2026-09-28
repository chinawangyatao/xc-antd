import { useControlledState } from '@rc-component/util';
import { theme } from 'antd';
import React, { useCallback } from 'react';
import {
  isProFieldEditOrUpdateMode,
  isProFieldReadMode,
} from '../../internal/fieldMode';
import type { ProFieldFC } from '../../types';
import { FieldDigitRangeEdit } from './FieldDigitRangeEdit';
import { FieldDigitRangeRead } from './FieldDigitRangeRead';
import type { FieldDigitRangeProps, ValuePair } from './types';

export type { FieldDigitRangeProps, Value, ValuePair } from './types';

const DigitRangeEdit = React.forwardRef(FieldDigitRangeEdit);
const DigitRangeRead = React.forwardRef(FieldDigitRangeRead);

/**
 * 数字范围组件
 */
const FieldDigitRange: ProFieldFC<FieldDigitRangeProps> = (
  {
    text,
    mode: type,
    render,
    placeholder,
    formItemRender,
    fieldProps,
    separator = '~',
    separatorWidth = 30,
  },
  ref,
) => {
  const { value, defaultValue, onChange } = fieldProps;
  const initialValue =
    defaultValue === undefined
      ? Array.isArray(text)
        ? text
        : undefined
      : defaultValue;
  const { token } = theme.useToken();
  const [valuePair, setValuePairInner] = useControlledState<
    ValuePair | null | undefined
  >(
    () => initialValue,
    value,
  );
  const setValuePair = useCallback(
    (next: ValuePair | undefined) => {
      setValuePairInner(next);
      onChange?.(next);
    },
    [onChange, setValuePairInner],
  );

  if (isProFieldReadMode(type)) {
    return (
      <DigitRangeRead
        text={text}
        mode={type}
        render={render}
        placeholder={placeholder}
        formItemRender={formItemRender}
        fieldProps={fieldProps}
        separator={separator}
        separatorWidth={separatorWidth}
        ref={ref}
      />
    );
  }

  if (isProFieldEditOrUpdateMode(type)) {
    const placeholderValue = fieldProps?.placeholder ||
      placeholder || [
        '请输入',
        '请输入',
      ];

    return (
      <DigitRangeEdit
        text={text}
        mode={type}
        render={render}
        placeholder={placeholder}
        formItemRender={formItemRender}
        fieldProps={fieldProps}
        separator={separator}
        separatorWidth={separatorWidth}
        valuePair={valuePair}
        setValuePair={setValuePair}
        token={token}
        placeholderValue={placeholderValue}
        ref={ref}
      />
    );
  }
  return null;
};

export default React.forwardRef(FieldDigitRange);

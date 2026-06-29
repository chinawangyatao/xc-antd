import { useControlledState } from '@rc-component/util';
import { theme } from 'antd';
import React, { useCallback, useRef } from 'react';
import {
  isProFieldEditOrUpdateMode,
  isProFieldReadMode,
} from '../../internal/fieldMode';
import type { ProFieldFC } from '../../types';
import { FieldDigitRangeEdit } from './FieldDigitRangeEdit';
import { FieldDigitRangeRead } from './FieldDigitRangeRead';
import type { FieldDigitRangeProps, ValuePair } from './types';

export type { FieldDigitRangeProps, Value, ValuePair } from './types';

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
  const { value, defaultValue, onChange, id } = fieldProps;
  

  const { token } = theme.useToken();
  const [valuePair, setValuePairInner] = useControlledState(
    () => defaultValue,
    value,
  );
  const setValuePair = useCallback(
    (
      updater:
        | ValuePair
        | undefined
        | ((prev: ValuePair | undefined) => ValuePair | undefined),
    ) => {
      setValuePairInner((prev: ValuePair | undefined) => {
        const next =
          typeof updater === 'function'
            ? (updater as (p: ValuePair | undefined) => ValuePair | undefined)(
                prev,
              )
            : updater;
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );
  const valuePairRef = useRef(valuePair);

  if (isProFieldReadMode(type)) {
    return FieldDigitRangeRead(
      {
        text,
        mode: type,
        render,
        placeholder,
        formItemRender,
        fieldProps,
        separator,
        separatorWidth,
      },
      ref,
    );
  }

  if (isProFieldEditOrUpdateMode(type)) {
    const placeholderValue = fieldProps?.placeholder ||
      placeholder || [
        '请输入',
        '请输入',
      ];

    return FieldDigitRangeEdit(
      {
        text,
        mode: type,
        render,
        placeholder,
        formItemRender,
        fieldProps,
        separator,
        separatorWidth,
        valuePair,
        valuePairRef,
        setValuePair,
        token,
        placeholderValue,
      },
      ref,
    );
  }
  return null;
};

export default React.forwardRef(FieldDigitRange);

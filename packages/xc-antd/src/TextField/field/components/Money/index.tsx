import React, { useCallback, useMemo } from 'react';
import {
  isProFieldEditOrUpdateMode,
  isProFieldReadMode,
} from '../../internal/fieldMode';
import type { ProFieldFC } from '../../types';
import { FieldMoneyEdit } from './FieldMoneyEdit';
import { FieldMoneyRead } from './FieldMoneyRead';
import { DefaultPrecisionCont } from './moneyFormat';
import type { FieldMoneyProps } from './types';

export type { FieldMoneyProps };

/**
 * 金额组件
 */
const FieldMoney: ProFieldFC<FieldMoneyProps> = (
  {
    text,
    mode: type,
    render,
    formItemRender,
    fieldProps,
    proFieldKey,
    valueEnum,
    placeholder,
    locale,
    customSymbol = fieldProps.customSymbol,
    numberFormatOptions = fieldProps?.numberFormatOptions,
    numberPopoverRender = fieldProps?.numberPopoverRender || false,
    ...rest
  },
  ref,
) => {
  const precision = fieldProps?.precision ?? DefaultPrecisionCont;
  const placeholderValue =
    placeholder || '请输入';

  const moneySymbol = useMemo((): string | undefined => {
    if (customSymbol) {
      return customSymbol;
    }

    if (rest.moneySymbol === false || fieldProps.moneySymbol === false) {
      return undefined;
    }
    return '¥';
  }, [customSymbol, fieldProps.moneySymbol, rest.moneySymbol]);

  const getFormateValue = useCallback(
    (value?: string | number) => {
      const reg = new RegExp(
        `\\B(?=(\\d{${
          3 + Math.max(precision - DefaultPrecisionCont, 0)
        }})+(?!\\d))`,
        'g',
      );
      const [intStr, floatStr] = String(value).split('.');

      const resultInt = intStr.replace(reg, ',');

      let resultFloat = '';

      if (floatStr && precision > 0) {
        resultFloat = `.${floatStr.slice(
          0,
          precision === undefined ? DefaultPrecisionCont : precision,
        )}`;
      }

      return `${resultInt}${resultFloat}`;
    },
    [precision],
  );

  if (isProFieldReadMode(type)) {
    return FieldMoneyRead(
      {
        text,
        mode: type,
        render,
        formItemRender,
        fieldProps,
        proFieldKey,
        valueEnum,
        placeholder,
        locale,
        customSymbol,
        numberFormatOptions,
        numberPopoverRender,
        ...rest,
        precision,
        moneySymbol,
      },
      ref,
    );
  }

  if (isProFieldEditOrUpdateMode(type)) {
    return FieldMoneyEdit(
      {
        text,
        mode: type,
        render,
        formItemRender,
        fieldProps,
        proFieldKey,
        valueEnum,
        placeholder,
        locale,
        customSymbol,
        numberFormatOptions,
        numberPopoverRender,
        ...rest,
        precision,
        placeholderValue,
        moneySymbol,
        getFormateValue,
      },
      ref,
    );
  }
  return null;
};

export default React.forwardRef(FieldMoney);

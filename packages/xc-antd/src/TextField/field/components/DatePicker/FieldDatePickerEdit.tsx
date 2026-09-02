import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { parseValueToDay } from '../../../utils';
import type { ProFieldFC } from '../../types';

type Props = Parameters<
  ProFieldFC<{
    text: string | number;
    format?: string;
    showTime?: boolean;
    variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
    picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year';
  }>
>[0] & {
  format: string;
  intl?: any;
};

export function FieldDatePickerEdit(props: Props, ref: React.Ref<unknown>) {
  const {
    text,
    mode,
    format,
    formItemRender,
    showTime,
    fieldProps,
    picker,
    variant,
  } = props;

  const {
    value,
    placeholder = '请选择',
  } = fieldProps;

  const dayValue = parseValueToDay(value) as dayjs.Dayjs;

  const dom = (
    <DatePicker
      picker={picker}
      showTime={showTime}
      format={format}
      placeholder={placeholder}
      ref={ref as React.Ref<any>}
      {...fieldProps}
      variant={variant ?? fieldProps?.variant}
      value={dayValue}
    />
  );

  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom);
  }
  return dom;
}

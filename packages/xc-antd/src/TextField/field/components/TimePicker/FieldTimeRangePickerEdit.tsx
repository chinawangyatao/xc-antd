import { TimePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { parseValueToDay } from '../../../utils';
import type { ProFieldFC } from '../../types';

type Props = Parameters<
  ProFieldFC<{
    text: string[] | number[];
    format?: string;
    variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
  }>
>[0] & {
  finalFormat: string;
  format: string;
};

export function FieldTimeRangePickerEdit(
  props: Props,
  ref: React.Ref<unknown>,
) {
  const {
    text,
    mode,
    format,
    formItemRender,
    fieldProps,
    variant,
    finalFormat,
  } = props;
  const { value, defaultValue, ...pickerProps } = fieldProps;
  const dayValue =
    value === undefined
      ? undefined
      : (parseValueToDay(value, finalFormat) as dayjs.Dayjs[] | null);
  const initialValue = defaultValue === undefined ? text : defaultValue;
  const defaultDayValue =
    value === undefined && Array.isArray(initialValue) && initialValue.length
      ? (parseValueToDay(initialValue, finalFormat) as dayjs.Dayjs[])
      : undefined;
  const rangeValueProps =
    value === undefined
      ? defaultDayValue === undefined
        ? {}
        : { defaultValue: defaultDayValue }
      : { value: dayValue };

  const dom = (
    <TimePicker.RangePicker
      ref={ref as React.Ref<any>}
      format={format}
      {...pickerProps}
      variant={variant ?? fieldProps?.variant}
      {...rangeValueProps}
    />
  );

  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom);
  }
  return dom;
}

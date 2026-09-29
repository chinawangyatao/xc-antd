import { TimePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { FieldLabel, parseValueToDay } from '../../../utils';
import type { ProFieldFC, ProFieldLightProps } from '../../types';

type Props = Parameters<
  ProFieldFC<
    {
      text: string[] | number[];
      format?: string;
      variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
    } & ProFieldLightProps
  >
>[0] & {
  finalFormat: string;
  format: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  intl?: any;
};

export function FieldTimeRangePickerLightEdit(
  props: Props,
  ref: React.Ref<unknown>,
) {
  const {
    text,
    mode,
    label,
    format,
    formItemRender,
    fieldProps,
    variant,
    lightLabel,
    finalFormat,
    open,
    setOpen,
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
  const shownValue = value === undefined ? defaultDayValue : dayValue;
  const rangeValueProps =
    value === undefined
      ? defaultDayValue === undefined
        ? {}
        : { defaultValue: defaultDayValue }
      : { value: dayValue };

  const {
    disabled,
    placeholder = [
      '请选择',
      '请选择',
    ],
  } = fieldProps;

  const handleLabelClick = () => {
    if (disabled) return;
    fieldProps?.onOpenChange?.(true);
    setOpen(true);
  };

  const dom = (
    <FieldLabel
      onClick={handleLabelClick}
      style={
        shownValue
          ? {
              paddingInlineEnd: 0,
            }
          : undefined
      }
      label={label}
      disabled={disabled}
      variant={variant}
      placeholder={placeholder}
      value={
        shownValue || open ? (
          <TimePicker.RangePicker
            format={format}
            ref={ref as React.Ref<any>}
            {...pickerProps}
            variant={variant ?? fieldProps?.variant}
            placeholder={placeholder}
            {...rangeValueProps}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              fieldProps?.onOpenChange?.(isOpen);
            }}
            open={open}
          />
        ) : null
      }
      downIcon={shownValue || open ? false : undefined}
      allowClear={false}
      ref={lightLabel}
    />
  );

  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom);
  }
  return dom;
}

import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { FieldLabel, parseValueToDay } from '../../../utils';
import type { ProFieldFC, ProFieldLightProps } from '../../types';

type Props = Parameters<
  ProFieldFC<
    {
      text: string[];
      format?: string;
      variant?: 'outlined' | 'borderless' | 'filled' | 'underlined';
      showTime?: boolean;
      picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year';
    } & ProFieldLightProps
  >
>[0] & {
  format: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  intl?: any;
};

export function FieldRangePickerLightEdit(
  props: Props,
  _ref: React.Ref<unknown>,
) {
  const {
    text,
    mode,
    label,
    format,
    picker,
    formItemRender,
    showTime,
    lightLabel,
    variant: propsVariant,
    fieldProps,
    open,
    setOpen,
    intl,
  } = props;

  const dayValue = parseValueToDay(fieldProps.value) as dayjs.Dayjs[];
  const handleRangeChange = (value: unknown) => {
    fieldProps?.onChange?.(value);

    if (!value) {
      setOpen(false);
    }
  };

  const handleLabelClick = () => {
    if (fieldProps.disabled) return;
    fieldProps?.onOpenChange?.(true);
    setOpen(true);
  };

  const dom = (
    <FieldLabel
      label={label}
      onClick={handleLabelClick}
      style={
        dayValue
          ? {
              paddingInlineEnd: 0,
            }
          : undefined
      }
      disabled={fieldProps.disabled}
      value={
        dayValue || open ? (
          <DatePicker.RangePicker
            picker={picker}
            showTime={showTime}
            format={format}
            {...fieldProps}
            placeholder={
              fieldProps.placeholder ?? [
                '请选择',
                '请选择',
              ]
            }
            variant={propsVariant ?? fieldProps?.variant}
            value={dayValue}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              fieldProps?.onOpenChange?.(isOpen);
            }}
            onChange={handleRangeChange}
            open={open}
          />
        ) : null
      }
      variant={propsVariant}
      allowClear={false}
      ref={lightLabel}
      downIcon={dayValue || open ? false : undefined}
    />
  );

  if (formItemRender) {
    return formItemRender(text, { mode, ...fieldProps }, dom);
  }
  return dom;
}

import { Input, InputNumber, Space } from 'antd';
import React from 'react';
import type { ProFieldFC } from '../../types';
import type { FieldDigitRangeProps, Value, ValuePair } from './types';

type Props = Parameters<ProFieldFC<FieldDigitRangeProps>>[0] & {
  valuePair: ValuePair | null | undefined;
  setValuePair: (next: ValuePair | undefined) => void;
  token: { colorBgContainer?: string };
  placeholderValue: string | string[];
};

export function FieldDigitRangeEdit(props: Props, _ref: React.Ref<unknown>) {
  const {
    text,
    mode: type,
    formItemRender,
    fieldProps,
    separator = '~',
    separatorWidth = 30,
    valuePair,
    setValuePair,
    token,
    placeholderValue,
  } = props;
  const {
    id,
    value: _rangeValue,
    defaultValue: _rangeDefaultValue,
    onChange: _rangeOnChange,
    placeholder: _rangePlaceholder,
    ...inputProps
  } = fieldProps;

  const handleGroupBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    if (Array.isArray(valuePair)) {
      const [value0, value1] = valuePair;
      if (
        typeof value0 === 'number' &&
        typeof value1 === 'number' &&
        value0 > value1
      ) {
        setValuePair([value1, value0]);
        return;
      }

      if (value0 === undefined && value1 === undefined) {
        setValuePair(undefined);
      }
    }
  };

  const handleChange = (index: number, changedValue: Value) => {
    const newValuePair = [...(valuePair || [])];
    newValuePair[index] = changedValue === null ? undefined : changedValue;
    setValuePair(newValuePair);
  };

  const getInputNumberPlaceholder = (index: number) =>
    Array.isArray(placeholderValue)
      ? placeholderValue[index]
      : placeholderValue;

  const dom = (
    <Space.Compact block style={{ minWidth: 0 }} onBlur={handleGroupBlur}>
      <InputNumber<number>
        {...inputProps}
        placeholder={getInputNumberPlaceholder(0)}
        id={id ? `${id}-min` : undefined}
        style={{ flex: '1 1 0', minWidth: 0 }}
        value={valuePair === null ? null : valuePair?.[0]}
        onChange={(changedValue) => handleChange(0, changedValue)}
      />
      <Input
        style={{
          flex: `0 0 ${separatorWidth}px`,
          width: separatorWidth,
          textAlign: 'center',
          borderInlineStart: 0,
          borderInlineEnd: 0,
          pointerEvents: 'none',
          backgroundColor: token?.colorBgContainer,
        }}
        placeholder={separator}
        disabled
      />
      <InputNumber<number>
        {...inputProps}
        placeholder={getInputNumberPlaceholder(1)}
        id={id ? `${id}-max` : undefined}
        style={{
          flex: '1 1 0',
          minWidth: 0,
          // borderInlineStart: 0,
        }}
        value={valuePair === null ? null : valuePair?.[1]}
        onChange={(changedValue) => handleChange(1, changedValue)}
      />
    </Space.Compact>
  );
  if (formItemRender) {
    return formItemRender(text, { mode: type, ...fieldProps }, dom);
  }
  return dom;
}

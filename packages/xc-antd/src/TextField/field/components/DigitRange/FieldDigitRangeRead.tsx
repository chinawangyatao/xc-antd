import React from 'react';
import type { ProFieldFC } from '../../types';
import type { FieldDigitRangeProps, Value } from './types';

export function FieldDigitRangeRead(
  props: Parameters<ProFieldFC<FieldDigitRangeProps>>[0],
  ref: React.Ref<unknown>,
) {
  const { text, mode: type, render, fieldProps, separator = '~' } = props;
  const getContent = (number: Value) => {
    if (number === null || number === undefined || number === '') {
      return '-';
    }
    const numericValue = Number(number);
    if (!Number.isFinite(numericValue)) {
      return '-';
    }
    const digit = new Intl.NumberFormat(undefined, {
      ...(fieldProps?.intlProps || {}),
    }).format(numericValue);

    return fieldProps?.formatter?.(digit) || digit;
  };
  const [start, end] = Array.isArray(text) ? text : [];
  const startContent = getContent(start);
  const endContent = getContent(end);
  const content =
    startContent === '-' && endContent === '-'
      ? '-'
      : `${startContent} ${separator} ${endContent}`;
  const dom = (
    <span ref={ref as React.Ref<HTMLSpanElement>}>
      {content}
    </span>
  );
  if (render) {
    return render(text, { mode: type, ...fieldProps }, dom);
  }
  return dom;
}

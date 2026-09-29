import { describe, expect, test } from 'bun:test';
import { TimePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TextField } from '../src/TextField';

type RangePickerElement = React.ReactElement<{
  value?: [Dayjs, Dayjs] | null;
  defaultValue?: [Dayjs, Dayjs];
  format?: string;
  disabled?: boolean;
  onChange?: (
    value: [Dayjs, Dayjs] | null,
    strings: [string, string] | null,
  ) => void;
}>;

describe('TextField timeRange', () => {
  test('renders the selected range and empty state in read mode', () => {
    const selected = renderToStaticMarkup(
      <TextField
        valueType="timeRange"
        mode="read"
        text={['09:15:00', '18:45:00']}
      />,
    );
    const empty = renderToStaticMarkup(
      <TextField valueType="timeRange" mode="read" text={[]} />,
    );

    expect(selected).toContain('09:15:00 ~ 18:45:00');
    expect(empty).toContain('>-<');
  });

  test('passes a formatted, controlled range and disabled state to TimePicker.RangePicker', () => {
    let picker: RangePickerElement | undefined;
    const html = renderToStaticMarkup(
      <TextField
        valueType="timeRange"
        mode="edit"
        value={['09:15', '18:45']}
        fieldProps={{ format: 'HH:mm', disabled: true }}
        formItemRender={(_text, _props, dom) => {
          picker = dom as RangePickerElement;
          return dom;
        }}
      />,
    );

    expect(picker?.type).toBe(TimePicker.RangePicker);
    expect(picker?.props.format).toBe('HH:mm');
    expect(picker?.props.disabled).toBe(true);
    expect(picker?.props.value?.map((value) => value.format('HH:mm'))).toEqual([
      '09:15',
      '18:45',
    ]);
    expect(html).toContain('disabled');
  });

  test('forwards selection and clear events from RangePicker', () => {
    let picker: RangePickerElement | undefined;
    const calls: Array<[unknown, unknown]> = [];
    renderToStaticMarkup(
      <TextField
        valueType="timeRange"
        mode="edit"
        value={['09:15:00', '18:45:00']}
        onChange={(value, strings) => calls.push([value, strings])}
        formItemRender={(_text, _props, dom) => {
          picker = dom as RangePickerElement;
          return dom;
        }}
      />,
    );

    const selected: [Dayjs, Dayjs] = [
      dayjs('10:30:00', 'HH:mm:ss'),
      dayjs('19:00:00', 'HH:mm:ss'),
    ];
    picker?.props.onChange?.(selected, ['10:30:00', '19:00:00']);
    picker?.props.onChange?.(null, null);

    expect(calls).toEqual([
      [selected, ['10:30:00', '19:00:00']],
      [null, null],
    ]);
  });

  test('uses text as an editable initial range when value is omitted', () => {
    let picker: RangePickerElement | undefined;
    renderToStaticMarkup(
      <TextField
        valueType="timeRange"
        mode="edit"
        text={['09:00:00', '18:00:00']}
        formItemRender={(_text, _props, dom) => {
          picker = dom as RangePickerElement;
          return dom;
        }}
      />,
    );

    expect(picker?.props.value).toBeUndefined();
    expect(picker?.props.defaultValue?.map((value) => value.format('HH:mm:ss')))
      .toEqual(['09:00:00', '18:00:00']);
  });

  test('normalizes fieldProps.defaultValue strings for the time range picker', () => {
    let picker: RangePickerElement | undefined;
    renderToStaticMarkup(
      <TextField
        valueType="timeRange"
        mode="edit"
        fieldProps={{ defaultValue: ['07:30', '16:15'], format: 'HH:mm' }}
        formItemRender={(_text, _props, dom) => {
          picker = dom as RangePickerElement;
          return dom;
        }}
      />,
    );

    expect(picker?.props.value).toBeUndefined();
    expect(picker?.props.defaultValue?.map((value) => value.format('HH:mm')))
      .toEqual(['07:30', '16:15']);
  });

  test('shows the initial range in light mode', () => {
    let picker: RangePickerElement | undefined;
    const html = renderToStaticMarkup(
      <TextField
        valueType="timeRange"
        mode="edit"
        light
        text={['08:00:00', '17:30:00']}
        formItemRender={(_text, _props, dom) => {
          const label = dom as React.ReactElement<{
            value?: RangePickerElement;
          }>;
          picker = label.props.value;
          return dom;
        }}
      />,
    );

    expect(picker?.type).toBe(TimePicker.RangePicker);
    expect(picker?.props.defaultValue?.map((value) => value.format('HH:mm:ss')))
      .toEqual(['08:00:00', '17:30:00']);
    expect(html).toContain('08:00:00');
    expect(html).toContain('17:30:00');
  });

  test('keeps a controlled null range empty instead of restoring text', () => {
    let picker: RangePickerElement | undefined;
    renderToStaticMarkup(
      <TextField
        valueType="timeRange"
        mode="edit"
        text={['09:00:00', '18:00:00']}
        value={null}
        formItemRender={(_text, _props, dom) => {
          picker = dom as RangePickerElement;
          return dom;
        }}
      />,
    );

    expect(picker?.props.value).toBeNull();
    expect(picker?.props.defaultValue).toBeUndefined();
  });
});

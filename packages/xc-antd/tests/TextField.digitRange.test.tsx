import { describe, expect, test } from 'bun:test';
import { InputNumber, Space } from 'antd';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TextField } from '../src/TextField';
import { FieldDigitRangeEdit } from '../src/TextField/field/components/DigitRange/FieldDigitRangeEdit';
import type { ValuePair } from '../src/TextField/field/components/DigitRange/types';

type NumberInputElement = React.ReactElement<{
  value?: number | null;
  defaultValue?: number;
  disabled?: boolean;
  onChange?: (value: number | null) => void;
}>;

type CompactElement = React.ReactElement<{
  children: React.ReactNode;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
}>;

function getRangeControl(props: React.ComponentProps<typeof TextField>) {
  let compact: CompactElement | undefined;
  renderToStaticMarkup(
    <TextField
      {...props}
      valueType="digitRange"
      mode="edit"
      formItemRender={(_text, _props, dom) => {
        compact = dom as CompactElement;
        return dom;
      }}
    />,
  );

  expect(compact?.type).toBe(Space.Compact);
  if (!compact) {
    throw new Error('digitRange did not render Space.Compact');
  }
  return compact;
}

function getRangeInputs(props: React.ComponentProps<typeof TextField>) {
  const compact = getRangeControl(props);
  const children = React.Children.toArray(compact.props.children) as NumberInputElement[];
  expect(children[0]?.type).toBe(InputNumber);
  expect(children[2]?.type).toBe(InputNumber);
  return [children[0], children[2]] as const;
}

function getEditControl(
  valuePair: ValuePair,
  setValuePair: (next: ValuePair | undefined) => void,
) {
  return FieldDigitRangeEdit({
    text: valuePair,
    mode: 'edit',
    fieldProps: {},
    valuePair,
    setValuePair,
    token: {},
    placeholderValue: ['最小值', '最大值'],
  }, null) as CompactElement;
}

describe('TextField digitRange', () => {
  test('shows the selected and empty range in read mode', () => {
    const selected = renderToStaticMarkup(
      <TextField valueType="digitRange" mode="read" text={[10, 99]} />,
    );
    const empty = renderToStaticMarkup(
      <TextField valueType="digitRange" mode="read" text={[]} />,
    );

    expect(selected).toContain('10 ~ 99');
    expect(empty).toContain('>-<');
    expect(empty).not.toContain('NaN');
  });

  test('shows a missing endpoint as empty in read mode', () => {
    const partial = renderToStaticMarkup(
      <TextField valueType="digitRange" mode="read" text={[10, undefined]} />,
    );

    expect(partial).toContain('10 ~ -');
    expect(partial).not.toContain('NaN');
  });

  test('shows zero and integer endpoints without forced decimal digits', () => {
    const html = renderToStaticMarkup(
      <TextField valueType="digitRange" mode="read" text={[0, 1]} />,
    );

    expect(html).toContain('0 ~ 1');
  });

  test('uses text as the editable initial range and passes input props through', () => {
    const [minimum, maximum] = getRangeInputs({
      text: [10, 99],
      fieldProps: { disabled: true },
    });

    expect(minimum.props.value ?? minimum.props.defaultValue).toBe(10);
    expect(maximum.props.value ?? maximum.props.defaultValue).toBe(99);
    expect(minimum.props.disabled).toBe(true);
    expect(maximum.props.disabled).toBe(true);
  });

  test('shows separate minimum and maximum placeholders', () => {
    const html = renderToStaticMarkup(
      <TextField
        valueType="digitRange"
        mode="edit"
        fieldProps={{ placeholder: ['最小值', '最大值'] }}
      />,
    );

    expect(html).toContain('placeholder="最小值"');
    expect(html).toContain('placeholder="最大值"');
  });

  test('prefers fieldProps.defaultValue over text for an uncontrolled range', () => {
    const [minimum, maximum] = getRangeInputs({
      text: [10, 99],
      fieldProps: { defaultValue: [3, 7] },
    });

    expect(minimum.props.value ?? minimum.props.defaultValue).toBe(3);
    expect(maximum.props.value ?? maximum.props.defaultValue).toBe(7);
  });

  test('uses the controlled value ahead of text and defaultValue', () => {
    const [minimum, maximum] = getRangeInputs({
      text: [10, 99],
      value: [12, 34],
      fieldProps: { defaultValue: [3, 7] },
    });

    expect(minimum.props.value).toBe(12);
    expect(maximum.props.value).toBe(34);
  });

  test('keeps a controlled cleared range empty despite text and defaultValue', () => {
    const [minimum, maximum] = getRangeInputs({
      text: [10, 99],
      value: null,
      fieldProps: { defaultValue: [3, 7] },
    });

    expect(minimum.props.value).toBeNull();
    expect(maximum.props.value).toBeNull();
    expect(minimum.props.defaultValue).toBeUndefined();
    expect(maximum.props.defaultValue).toBeUndefined();
  });

  test('emits partial values while editing, then an empty range after clearing both inputs', () => {
    const changes: unknown[] = [];
    const setValuePair = (next: ValuePair | undefined) => changes.push(next);
    const initial = getEditControl([10, 99], setValuePair);
    const initialChildren = React.Children.toArray(initial.props.children) as NumberInputElement[];
    initialChildren[0]?.props.onChange?.(null);

    const partial = getEditControl([undefined, 99], setValuePair);
    const partialChildren = React.Children.toArray(partial.props.children) as NumberInputElement[];
    partialChildren[2]?.props.onChange?.(null);

    const empty = getEditControl([undefined, undefined], setValuePair);
    empty.props.onBlur?.({ relatedTarget: null } as React.FocusEvent<HTMLElement>);

    expect(changes).toEqual([
      [undefined, 99],
      [undefined, undefined],
      undefined,
    ]);
  });

  test('sorts only when focus leaves the input group', () => {
    const changes: unknown[] = [];
    const compact = getEditControl([99, 10], (next) => changes.push(next));
    const innerInput = {} as EventTarget;
    const currentTarget = {
      contains: (target: EventTarget) => target === innerInput,
    } as HTMLElement;

    compact.props.onBlur?.({
      currentTarget,
      relatedTarget: innerInput,
    } as React.FocusEvent<HTMLElement>);
    expect(changes).toEqual([]);

    compact.props.onBlur?.({
      currentTarget,
      relatedTarget: null,
    } as React.FocusEvent<HTMLElement>);
    expect(changes).toEqual([[10, 99]]);
  });
});

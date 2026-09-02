import { Select, Space, Tag } from 'antd';
import type { SelectProps, TagProps } from 'antd';
import React from 'react';
import type {
  ProFieldValueEnumType,
  ProSchemaValueEnumType,
} from '../../../utils';
import type { ProFieldFC } from '../../types';

export type FieldTagValue =
  | string
  | number
  | boolean
  | {
      label?: React.ReactNode;
      value?: string | number | boolean;
      color?: TagProps['color'];
    };

export interface FieldTagProps {
  text: FieldTagValue | FieldTagValue[];
  separator?: string;
  maxTagCount?: number;
  tagProps?:
    | TagProps
    | ((item: ResolvedTagItem, index: number) => TagProps);
}

export interface ResolvedTagItem {
  key: string;
  label: React.ReactNode;
  value: string | number;
  color?: TagProps['color'];
  disabled?: boolean;
}

const statusColors: Record<string, TagProps['color']> = {
  Success: 'green',
  success: 'green',
  Error: 'red',
  error: 'red',
  Warning: 'orange',
  warning: 'orange',
  Processing: 'blue',
  processing: 'blue',
  Default: 'default',
  default: 'default',
};

function normalizeValues(
  text: FieldTagValue | FieldTagValue[],
  separator?: string,
): FieldTagValue[] {
  if (Array.isArray(text)) return text;
  if (text === undefined || text === null || text === '') return [];
  if (separator && typeof text === 'string') {
    return text.split(separator).map((item) => item.trim()).filter(Boolean);
  }
  return [text];
}

function getEnumItem(
  valueEnum: ProFieldValueEnumType | undefined,
  value: string | number | boolean,
) {
  if (valueEnum instanceof Map) {
    return valueEnum.get(value) ?? valueEnum.get(String(value));
  }
  return valueEnum?.[String(value)];
}

function getEnumValues(valueEnum: ProFieldValueEnumType | undefined) {
  if (valueEnum instanceof Map) return Array.from(valueEnum.keys());
  return Object.keys(valueEnum ?? {});
}

export function resolveTagItems(
  text: FieldTagValue | FieldTagValue[],
  valueEnum?: ProFieldValueEnumType,
  separator?: string,
): ResolvedTagItem[] {
  return normalizeValues(text, separator).map((item, index) => {
    const isObject = typeof item === 'object' && item !== null;
    const rawValue = isObject ? item.value ?? index : item;
    const enumItem = getEnumItem(valueEnum, rawValue);
    const isEnumConfig =
      typeof enumItem === 'object' &&
      enumItem !== null &&
      !React.isValidElement(enumItem) &&
      'text' in enumItem;
    const config = isEnumConfig
      ? enumItem as ProSchemaValueEnumType
      : undefined;
    const value = typeof rawValue === 'boolean' ? String(rawValue) : rawValue;
    return {
      key: `${String(value)}-${index}`,
      value,
      label: config?.text ?? (isEnumConfig ? String(value) : enumItem) ??
        (isObject ? item.label ?? String(value) : String(value)),
      color: isObject
        ? item.color ?? config?.color ?? statusColors[config?.status ?? '']
        : config?.color ?? statusColors[config?.status ?? ''],
      disabled: config?.disabled,
    };
  });
}

const FieldTag: ProFieldFC<FieldTagProps> = (props, ref) => {
  const {
    text,
    mode,
    render,
    formItemRender,
    fieldProps = {},
    valueEnum,
    separator,
    maxTagCount,
    tagProps,
  } = props;
  const items = resolveTagItems(text, valueEnum, separator);

  if (mode === 'edit' || mode === 'update') {
    const selectProps = fieldProps as SelectProps<Array<string | number>>;
    const optionItems = valueEnum
      ? resolveTagItems(getEnumValues(valueEnum), valueEnum)
      : items;
    const dom = (
      <Select<Array<string | number>>
        ref={ref as React.Ref<any>}
        mode="tags"
        allowClear
        placeholder="请输入或选择标签"
        maxTagCount={maxTagCount}
        options={optionItems.map((item) => ({
          value: item.value,
          label: item.label,
          disabled: item.disabled,
        }))}
        {...selectProps}
      />
    );
    return formItemRender
      ? formItemRender(text, { mode, ...fieldProps }, dom)
      : dom;
  }

  const visibleItems = maxTagCount === undefined
    ? items
    : items.slice(0, maxTagCount);
  const dom = items.length === 0 ? (
    <>-</>
  ) : (
    <Space size={[4, 4]} wrap>
      {visibleItems.map((item, index) => {
        const resolvedTagProps = typeof tagProps === 'function'
          ? tagProps(item, index)
          : tagProps;
        return (
          <Tag key={item.key} color={item.color} {...resolvedTagProps}>
            {item.label}
          </Tag>
        );
      })}
      {maxTagCount !== undefined && items.length > maxTagCount && (
        <Tag>+{items.length - maxTagCount}</Tag>
      )}
    </Space>
  );
  return render ? render(text, { mode, ...fieldProps }, dom) : dom;
};

export default React.forwardRef(FieldTag);

import type { ReactNode } from 'react';

// ==================== ValueEnum 类型（自包含，不依赖 provider） ====================

export type ProSchemaValueEnumType = {
  text: ReactNode;
  status?: string;
  color?: string;
  disabled?: boolean;
};

export type ProSchemaValueEnumMap = Map<
  string | number | boolean,
  ProSchemaValueEnumType | ReactNode
>;

export type ProSchemaValueEnumObj = Record<
  string,
  ProSchemaValueEnumType | ReactNode
>;

export type ProFieldValueEnumType =
  | ProSchemaValueEnumMap
  | ProSchemaValueEnumObj;

// ==================== Field 通用类型 ====================

export type ProFieldTextType =
  | ReactNode
  | ReactNode[]
  | Record<string, any>
  | Record<string, any>[];

export type RequestOptionsType = {
  label?: ReactNode;
  value?: string | number | boolean;
  optionType?: 'optGroup' | 'option';
  options?: Omit<RequestOptionsType, 'children' | 'optionType'>[];
  [key: string]: any;
};

export type ProFieldRequestData<U = any> = (
  params: U,
  props: any,
) => Promise<RequestOptionsType[]>;

export type ProFieldValueObjectType = {
  type: 'progress' | 'money' | 'percent' | 'image';
  status?: 'normal' | 'active' | 'success' | 'exception' | undefined;
  locale?: string;
  showSymbol?: ((value: any) => boolean) | boolean;
  showColor?: boolean;
  precision?: number;
  moneySymbol?: boolean;
  request?: ProFieldRequestData;
  width?: number;
};

export type ProFieldValueType =
  | 'text'
  | 'password'
  | 'money'
  | 'index'
  | 'indexBorder'
  | 'option'
  | 'textarea'
  | 'date'
  | 'dateWeek'
  | 'dateMonth'
  | 'dateQuarter'
  | 'dateYear'
  | 'dateTime'
  | 'fromNow'
  | 'dateRange'
  | 'dateTimeRange'
  | 'dateWeekRange'
  | 'dateMonthRange'
  | 'dateQuarterRange'
  | 'dateYearRange'
  | 'time'
  | 'timeRange'
  | 'select'
  | 'checkbox'
  | 'rate'
  | 'slider'
  | 'radio'
  | 'radioButton'
  | 'progress'
  | 'percent'
  | 'digit'
  | 'digitRange'
  | 'second'
  | 'code'
  | 'jsonCode'
  | 'avatar'
  | 'switch'
  | 'image'
  | 'cascader'
  | 'treeSelect'
  | 'color'
  | 'tag'
  | 'segmented';

export type ProFieldValueTypeInput =
  | ProFieldValueType
  | ProFieldValueObjectType;

export const PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES = [
  'group',
  'formList',
  'formSet',
  'divider',
  'dependency',
] as const;

export type ProFieldBuiltinValueType = Exclude<
  ProFieldValueType,
  (typeof PRO_FIELD_SCHEMA_LAYOUT_VALUE_TYPES)[number]
>;

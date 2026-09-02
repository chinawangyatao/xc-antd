import type React from 'react';
import type {
  BaseProFieldFC,
  ProFieldFCRenderProps,
  ProRenderFieldPropsType,
} from '../provider';
import type {
  ProFieldRequestData,
  ProFieldTextType,
  ProFieldValueType,
  ProFieldValueTypeInput,
} from '../utils';

export type ProFieldEmptyText = string | false;

export type ProFieldFC<T = {}> = React.ForwardRefRenderFunction<
  any,
  BaseProFieldFC & ProRenderFieldPropsType & T
>;

export type ProFieldLightProps = {
  lightLabel?: React.RefObject<{
    labelRef: React.RefObject<HTMLElement>;
    clearRef: React.RefObject<HTMLElement>;
  }>;
  labelTrigger?: boolean;
};

export type ProFieldValueTypeFunction<T> = (item: T) => ProFieldValueTypeInput;

export type ProFieldRenderProps = Omit<
  ProFieldFCRenderProps,
  'text' | 'placeholder'
> &
  ProRenderFieldPropsType & {
    request?: ProFieldRequestData;
    emptyText?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    [key: string]: any;
  };

export type ProFieldPropsType = {
  text?: ProFieldTextType;
  valueType?: ProFieldValueTypeInput;
} & ProFieldRenderProps;

export type TextFieldValueTypePropsMap = {
  text: {};
  password: {};
  textarea: {};
  code: {};
  jsonCode: {};
  date: {
    format?: string;
    picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year';
    showTime?: boolean;
  };
  dateWeek: {
    format?: string;
    picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year';
    showTime?: boolean;
  };
  dateMonth: {
    format?: string;
    picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year';
    showTime?: boolean;
  };
  dateQuarter: {
    format?: string;
    picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year';
    showTime?: boolean;
  };
  dateYear: {
    format?: string;
    picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year';
    showTime?: boolean;
  };
  dateTime: {
    format?: string;
    picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year';
    showTime?: boolean;
  };
  dateRange: {
    format?: string;
    showTime?: boolean;
  };
  dateTimeRange: {
    format?: string;
    showTime?: boolean;
  };
  dateWeekRange: {
    format?: string;
    showTime?: boolean;
  };
  dateMonthRange: {
    format?: string;
    showTime?: boolean;
  };
  dateQuarterRange: {
    format?: string;
    showTime?: boolean;
  };
  dateYearRange: {
    format?: string;
    showTime?: boolean;
  };
  time: {
    format?: string;
  };
  timeRange: {
    format?: string;
  };
  fromNow: {};
  index: {};
  indexBorder: {};
  select: {
    valueEnum?: ProFieldRenderProps['valueEnum'];
    request?: ProFieldRequestData;
    params?: any;
    debounceTime?: number;
    defaultKeyWords?: string;
  };
  checkbox: {
    valueEnum?: ProFieldRenderProps['valueEnum'];
    request?: ProFieldRequestData;
    params?: any;
    debounceTime?: number;
  };
  radio: {
    valueEnum?: ProFieldRenderProps['valueEnum'];
    request?: ProFieldRequestData;
    params?: any;
    debounceTime?: number;
  };
  radioButton: {
    valueEnum?: ProFieldRenderProps['valueEnum'];
    request?: ProFieldRequestData;
    params?: any;
    debounceTime?: number;
  };
  rate: {};
  slider: {};
  progress: {};
  percent: {
    showSymbol?: boolean;
    precision?: number;
    showColor?: boolean;
  };
  digit: {};
  digitRange: {
    separator?: string;
    separatorWidth?: number;
  };
  second: {};
  avatar: {};
  switch: {};
  image: {
    width?: number;
  };
  money: {
    locale?: string;
    moneySymbol?: boolean;
    customSymbol?: string;
    numberFormatOptions?: {
      localeMatcher?: string;
      style?: string;
      currency?: string;
      currencyDisplay?: string;
      currencySign?: string;
      useGrouping?: boolean;
      minimumIntegerDigits?: number;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      minimumSignificantDigits?: number;
      maximumSignificantDigits?: number;
    };
    numberPopoverRender?:
      | ((props: Record<string, any>, defaultText: string) => React.ReactNode)
      | boolean;
  };
  option: {};
  cascader: {
    valueEnum?: ProFieldRenderProps['valueEnum'];
    request?: ProFieldRequestData;
    params?: any;
    debounceTime?: number;
  };
  treeSelect: {
    valueEnum?: ProFieldRenderProps['valueEnum'];
    request?: ProFieldRequestData;
    params?: any;
    debounceTime?: number;
  };
  color: {};
  tag: {
    separator?: string;
    maxTagCount?: number;
  };
  segmented: {};
};

export type TextFieldProps<
  T extends ProFieldValueTypeInput = ProFieldValueTypeInput,
> = T extends ProFieldValueType
  ? ProFieldPropsType & (TextFieldValueTypePropsMap[T] extends infer U ? U : {})
  : ProFieldPropsType;

export interface TextFieldComponent {
  <T extends ProFieldValueTypeInput = 'text'>(
    props: TextFieldProps<T> & React.RefAttributes<any>,
  ): React.ReactElement | null;
  displayName?: string;
}

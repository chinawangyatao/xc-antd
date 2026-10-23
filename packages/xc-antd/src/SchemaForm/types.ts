import type React from 'react';
import type { FormGroupProps } from '../FormGroup';
import type {
  ButtonProps,
  ColProps,
  FormInstance,
  FormItemProps,
  FormProps,
} from 'antd';
import type { NamePath } from 'antd/es/form/interface';
import type { ProFieldFCMode } from '../TextField/provider';
import type {
  ProFieldRequestData,
  ProFieldValueEnumType,
  ProFieldValueTypeInput,
} from '../TextField/utils';

export type SchemaFormValues = object;

export type SchemaFieldState<Values extends SchemaFormValues> =
  | boolean
  | ((values: Values) => boolean);

export interface SchemaFormFieldContext<
  Values extends SchemaFormValues,
  SubmitValues extends SchemaFormValues = Values,
> {
  value: unknown;
  onChange: (...args: any[]) => void;
  values: Values;
  form: FormInstance<Values>;
  mode: ProFieldFCMode;
  field: SchemaFormField<Values, SubmitValues>;
  /** 自定义控件应展开此属性，保留 Form.Item 的 id、ARIA、校验事件及字段值。 */
  controlProps: Record<string, unknown>;
  /** 连接到可聚焦控件，供 Form 的聚焦与滚动使用。 */
  ref: React.ForwardedRef<unknown>;
}

export interface SchemaFormField<
  Values extends SchemaFormValues,
  SubmitValues extends SchemaFormValues = Values,
> {
  key?: React.Key;
  name: (keyof Values & string) | NamePath;
  label?: React.ReactNode;
  valueType?: ProFieldValueTypeInput;
  valueEnum?: ProFieldValueEnumType;
  request?: ProFieldRequestData;
  params?: unknown;
  required?: boolean;
  colProps?: ColProps;
  formItemProps?: Omit<
    FormItemProps<Values>,
    'children' | 'dependencies' | 'label' | 'name'
  >;
  fieldProps?:
    | Record<string, unknown>
    | ((values: Values, form: FormInstance<Values>) => Record<string, unknown>);
  dependencies?: NamePath[];
  hidden?: SchemaFieldState<Values>;
  disabled?: SchemaFieldState<Values>;
  readonly?: SchemaFieldState<Values>;
  mode?: ProFieldFCMode;
  transform?: (value: unknown, values: Values) => Partial<SubmitValues>;
  renderFormItem?: (
    context: SchemaFormFieldContext<Values, SubmitValues>,
  ) => React.ReactNode;
}

export interface SchemaFormGroup<
  Values extends SchemaFormValues,
  SubmitValues extends SchemaFormValues = Values,
> {
  key: React.Key;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  fields: SchemaFormField<Values, SubmitValues>[];
  gutter?: number;
  /** 分组容器的原生样式与 Row 布局；优先于 SchemaForm.groupProps。 */
  groupProps?: Omit<FormGroupProps, 'children' | 'title' | 'extra'>;
  hidden?: SchemaFieldState<Values>;
}

export interface SchemaFormSubmitterConfig<
  Values extends SchemaFormValues,
  SubmitValues extends SchemaFormValues = Values,
> {
  submitText?: React.ReactNode;
  resetText?: React.ReactNode;
  showReset?: boolean;
  align?: 'left' | 'center' | 'right';
  submitButtonProps?: ButtonProps;
  resetButtonProps?: ButtonProps;
  render?: (
    action: SchemaFormAction<Values, SubmitValues>,
    defaultDom: React.ReactNode,
  ) => React.ReactNode;
}

export interface SchemaFormAction<
  Values extends SchemaFormValues,
  SubmitValues extends SchemaFormValues = Values,
> {
  form: FormInstance<Values>;
  validateFields: FormInstance<Values>['validateFields'];
  resetFields: FormInstance<Values>['resetFields'];
  getFieldsValue: FormInstance<Values>['getFieldsValue'];
  setFieldsValue: FormInstance<Values>['setFieldsValue'];
  submit: () => Promise<SubmitValues>;
}

export interface SchemaFormProps<
  Values extends SchemaFormValues,
  SubmitValues extends SchemaFormValues = Values,
> {
  schema: SchemaFormGroup<Values, SubmitValues>[];
  form?: FormInstance<Values>;
  actionRef?: React.Ref<SchemaFormAction<Values, SubmitValues>>;
  mode?: ProFieldFCMode;
  initialValues?: Partial<Values>;
  formProps?: Omit<
    FormProps<Values>,
    'children' | 'form' | 'initialValues' | 'onFinish' | 'onValuesChange'
  >;
  /** 所有分组的容器配置；默认不增加 padding，独立分组可设 style.padding 为 24。 */
  groupProps?: Omit<FormGroupProps, 'children' | 'title' | 'extra'>;
  submitter?: false | SchemaFormSubmitterConfig<Values, SubmitValues>;
  onFinish?: (values: SubmitValues) => boolean | void | Promise<boolean | void>;
  onReset?: () => void;
  onValuesChange?: (changedValues: Partial<Values>, values: Values) => void;
  className?: string;
  style?: React.CSSProperties;
}

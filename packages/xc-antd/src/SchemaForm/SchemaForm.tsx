import { Button, Col, Form } from 'antd';
import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import React from 'react';
import { FormGroup } from '../FormGroup';
import { TextField } from '../TextField';
import type {
  SchemaFormAction,
  SchemaFormField,
  SchemaFormFieldContext,
  SchemaFormProps,
  SchemaFormValues,
} from './types';
import {
  applySchemaTransforms,
  getSchemaColProps,
  getSchemaFieldKey,
  resolveSchemaFieldState,
} from './utils';
import './style.css';

interface SchemaFieldControlProps<
  Values extends SchemaFormValues,
  SubmitValues extends SchemaFormValues = Values,
> {
  field: SchemaFormField<Values, SubmitValues>;
  form: ReturnType<typeof Form.useForm<Values>>[0];
  values: Values;
  mode: NonNullable<SchemaFormProps<Values>['mode']>;
  value?: unknown;
  onChange?: (...args: any[]) => void;
}

function SchemaFieldControl<
  Values extends SchemaFormValues,
  SubmitValues extends SchemaFormValues = Values,
>({
  field,
  form,
  values,
  mode,
  value,
  onChange = () => undefined,
}: SchemaFieldControlProps<Values, SubmitValues>) {
  const fieldMode = field.mode ?? mode;
  const disabled = resolveSchemaFieldState(field.disabled, values);
  const readonly = resolveSchemaFieldState(field.readonly, values);
  const resolvedFieldProps = typeof field.fieldProps === 'function'
    ? field.fieldProps(values, form)
    : field.fieldProps;
  const context: SchemaFormFieldContext<Values, SubmitValues> = {
    value,
    onChange,
    values,
    form,
    mode: fieldMode,
    field,
  };

  if (field.renderFormItem) return field.renderFormItem(context);

  return (
    <TextField
      mode={fieldMode}
      text={value as React.ReactNode}
      value={value}
      onChange={onChange}
      valueType={field.valueType ?? 'text'}
      valueEnum={field.valueEnum as never}
      request={field.request}
      params={field.params}
      readonly={readonly}
      fieldProps={{
        ...resolvedFieldProps,
        disabled: disabled || resolvedFieldProps?.disabled,
        style: {
          width: '100%',
          ...(resolvedFieldProps?.style as React.CSSProperties),
        },
      }}
    />
  );
}

export function SchemaForm<
  Values extends SchemaFormValues,
  SubmitValues extends SchemaFormValues = Values,
>({
  schema,
  form: formProp,
  actionRef,
  mode = 'edit',
  initialValues,
  formProps,
  submitter = {},
  onFinish,
  onReset,
  onValuesChange,
  className,
  style,
}: SchemaFormProps<Values, SubmitValues>) {
  const [innerForm] = Form.useForm<Values>();
  const form = formProp ?? innerForm;
  const watchedValues = Form.useWatch([], form);
  const values = (watchedValues ?? initialValues ?? {}) as Values;
  const [submitting, setSubmitting] = React.useState(false);

  const runFinish = React.useCallback(async (rawValues: Values) => {
    const transformedValues = applySchemaTransforms(rawValues, schema);
    setSubmitting(true);
    try {
      await onFinish?.(transformedValues);
      return transformedValues;
    } finally {
      setSubmitting(false);
    }
  }, [onFinish, schema]);

  const submit = React.useCallback(async () => {
    const rawValues = await form.validateFields();
    return runFinish(rawValues);
  }, [form, runFinish]);

  const resetFields = React.useCallback(() => {
    form.resetFields();
    onReset?.();
  }, [form, onReset]);

  const action = React.useMemo<SchemaFormAction<Values, SubmitValues>>(() => ({
    form,
    validateFields: form.validateFields,
    resetFields,
    getFieldsValue: form.getFieldsValue,
    setFieldsValue: form.setFieldsValue,
    submit,
  }), [form, resetFields, submit]);

  React.useImperativeHandle(actionRef, () => action, [action]);

  const submitterConfig = submitter === false ? undefined : submitter;
  const submitterAlign = submitterConfig?.align ?? 'right';
  const defaultSubmitter = mode === 'read' || !submitterConfig ? null : (
    <div className={`xc-schema-form__submitter xc-schema-form__submitter--${submitterAlign}`}>
      {submitterConfig.showReset !== false && (
        <Button
          icon={<ReloadOutlined />}
          onClick={resetFields}
          {...submitterConfig.resetButtonProps}
        >
          {submitterConfig.resetText ?? '重置'}
        </Button>
      )}
      <Button
        type="primary"
        htmlType="submit"
        icon={<SaveOutlined />}
        loading={submitting}
        {...submitterConfig.submitButtonProps}
      >
        {submitterConfig.submitText ?? '提交'}
      </Button>
    </div>
  );
  const submitterDom = submitterConfig?.render
    ? submitterConfig.render(action, defaultSubmitter)
    : defaultSubmitter;

  return (
    <Form<Values>
      {...formProps}
      form={form}
      initialValues={initialValues}
      layout={formProps?.layout ?? 'vertical'}
      onFinish={(rawValues) => {
        void runFinish(rawValues);
      }}
      onValuesChange={onValuesChange}
      className={['xc-schema-form', className].filter(Boolean).join(' ')}
      style={style}
    >
      {schema.map((group) => {
        if (resolveSchemaFieldState(group.hidden, values)) return null;
        return (
          <FormGroup
            key={group.key}
            title={group.title}
            extra={group.extra}
            gutter={group.gutter}
          >
            {group.fields.map((field, index) => {
              if (resolveSchemaFieldState(field.hidden, values)) return null;
              const fieldTitle = typeof field.label === 'string'
                ? field.label
                : '该字段';
              const rules = field.formItemProps?.rules ?? (field.required
                ? [{ required: true, message: `请填写${fieldTitle}` }]
                : undefined);
              return (
                <Col
                  key={getSchemaFieldKey(field, index)}
                  {...getSchemaColProps(field.colProps)}
                >
                  <Form.Item<Values>
                    name={field.name}
                    label={field.label}
                    dependencies={field.dependencies}
                    preserve
                    {...field.formItemProps}
                    rules={rules}
                  >
                    <SchemaFieldControl
                      field={field}
                      form={form}
                      values={values}
                      mode={mode}
                    />
                  </Form.Item>
                </Col>
              );
            })}
          </FormGroup>
        );
      })}
      {submitterDom}
    </Form>
  );
}

export default SchemaForm;

import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaForm, type SchemaFormGroup } from '../src/SchemaForm';
import { mergeFormControlProps } from '../src/shared/formControlProps';
import {
  applySchemaTransforms,
  getSchemaColProps,
  getSchemaFieldKey,
  resolveSchemaFieldState,
} from '../src/SchemaForm/utils';

interface FormValues {
  name: string;
  status: 'active' | 'disabled';
  period: [string, string];
}

interface SubmitValues {
  name: string;
  status: 'active' | 'disabled';
  startDate?: string;
  endDate?: string;
}

const schema: SchemaFormGroup<FormValues, SubmitValues>[] = [
  {
    key: 'base',
    title: '基础配置',
    fields: [
      { name: 'name', label: '名称', valueType: 'text', required: true },
      { name: 'status', label: '状态', valueType: 'select' },
      {
        name: 'period',
        label: '周期',
        valueType: 'dateRange',
        transform: (value) => {
          const range = value as [string, string];
          return { startDate: range[0], endDate: range[1] };
        },
      },
    ],
  },
];

describe('SchemaForm', () => {
  test('resolves static and functional field states', () => {
    const values: FormValues = {
      name: '项目',
      status: 'disabled',
      period: ['2026-01-01', '2026-12-31'],
    };
    expect(resolveSchemaFieldState(true, values)).toBe(true);
    expect(resolveSchemaFieldState((current) => current.status === 'disabled', values))
      .toBe(true);
  });

  test('creates stable keys for nested name paths', () => {
    expect(getSchemaFieldKey({ name: ['contact', 'phone'] }, 0))
      .toBe('contact.phone');
  });

  test('respects fixed and responsive colProps', () => {
    expect(getSchemaColProps()).toEqual({ xs: 24, md: 12 });
    expect(getSchemaColProps({ span: 24 })).toEqual({ span: 24 });
    expect(getSchemaColProps({ md: 8, lg: 6 })).toEqual({
      xs: 24,
      md: 8,
      lg: 6,
    });
  });

  test('applies field transforms with a typed submit result', () => {
    const result = applySchemaTransforms<FormValues, SubmitValues>(
      {
        name: '项目',
        status: 'active',
        period: ['2026-01-01', '2026-12-31'],
      },
      schema,
    );
    expect(result).toEqual({
      name: '项目',
      status: 'active',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });
  });

  test('wraps read-only field content without changing column alignment', () => {
    const html = renderToStaticMarkup(
      <SchemaForm<FormValues, SubmitValues>
        schema={schema}
        mode="read"
        initialValues={{
          name: '项目',
          status: 'active',
          period: ['2026-01-01', '2026-12-31'],
        }}
        submitter={false}
      />,
    );
    expect(html).toContain('xc-schema-form__read-value');
    expect(html).toContain('ant-form-item-required');
  });

  test('passes label ids and required semantics to native controls', () => {
    const html = renderToStaticMarkup(
      <SchemaForm
        schema={[{ key: 'fields', fields: [
          { name: 'text', label: '文本', required: true, fieldProps: { id: 'unrelated-id' } },
          { name: 'number', label: '数值', valueType: 'digit', required: true },
          { name: 'select', label: '选择', valueType: 'select', required: true, valueEnum: { a: '选项' } },
          { name: 'date', label: '日期', valueType: 'date', required: true },
          { name: 'radio', label: '单选', valueType: 'radio', required: true, valueEnum: { a: '选项' } },
          { name: 'checkbox', label: '多选', valueType: 'checkbox', required: true, valueEnum: { a: '选项' } },
        ] }]}
        formProps={{ name: 'association' }}
        submitter={false}
      />,
    );
    for (const name of ['text', 'number', 'select', 'date', 'radio', 'checkbox']) {
      expect(html).toContain(`for="association_${name}"`);
      expect(html).toContain(`id="association_${name}"`);
    }
    expect(html).not.toContain('id="unrelated-id"');
    expect(html.match(/aria-required="true"/g)?.length).toBeGreaterThanOrEqual(6);
  });

  test('exposes Form.Item blur validation and ref to custom controls', () => {
    let captured: Record<string, unknown> | undefined;
    let blurCount = 0;
    const html = renderToStaticMarkup(
      <SchemaForm
        schema={[{ key: 'custom', fields: [{
          name: 'name',
          label: '名称',
          fieldProps: { onBlur: () => { blurCount += 1; } },
          renderFormItem: ({ controlProps, ref }) => {
            captured = controlProps;
            expect(ref).toBeDefined();
            return <input {...controlProps} />;
          },
        }] }]}
        formProps={{ name: 'blur', validateTrigger: 'onBlur' }}
        submitter={false}
      />,
    );
    expect(html).toContain('id="blur_name"');
    expect(typeof captured?.onBlur).toBe('function');
    (captured?.onBlur as () => void)();
    expect(blurCount).toBe(1);
  });

  test('merges event handlers once and retains accessible descriptions', () => {
    const calls: string[] = [];
    const formHandler = () => calls.push('form');
    const merged = mergeFormControlProps(
      { onBlur: () => calls.push('business'), 'aria-describedby': 'hint' },
      { onBlur: formHandler, 'aria-describedby': 'hint error', id: 'form-field' },
    );
    (merged.onBlur as () => void)();
    expect(calls).toEqual(['business', 'form']);
    expect(merged['aria-describedby']).toBe('hint error');
    expect(merged.id).toBe('form-field');
    calls.length = 0;
    const sameHandler = mergeFormControlProps({ onBlur: formHandler }, { onBlur: formHandler });
    (sameHandler.onBlur as () => void)();
    expect(calls).toEqual(['form']);
  });
});

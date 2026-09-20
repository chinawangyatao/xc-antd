import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { SchemaForm, type SchemaFormGroup } from '../src/SchemaForm';
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

  test('wraps read-only field content with horizontal spacing', () => {
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
});

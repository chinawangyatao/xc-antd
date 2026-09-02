import type { ColProps } from 'antd';
import type {
  SchemaFieldState,
  SchemaFormField,
  SchemaFormGroup,
  SchemaFormValues,
} from './types';

const responsiveKeys: Array<keyof ColProps> = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  'xxl',
];

export function getSchemaColProps(colProps?: ColProps): ColProps {
  if (!colProps) return { xs: 24, md: 12 };
  if (colProps.span !== undefined) return colProps;

  const hasResponsiveConfig = responsiveKeys.some(
    (key) => colProps[key] !== undefined,
  );
  if (hasResponsiveConfig) {
    return { xs: colProps.xs ?? 24, ...colProps };
  }
  return { xs: 24, md: 12, ...colProps };
}

export function resolveSchemaFieldState<Values extends SchemaFormValues>(
  state: SchemaFieldState<Values> | undefined,
  values: Values,
): boolean {
  return typeof state === 'function' ? state(values) : state ?? false;
}

export function getSchemaFieldKey<
  Values extends SchemaFormValues,
  SubmitValues extends SchemaFormValues = Values,
>(
  field: SchemaFormField<Values, SubmitValues>,
  index: number,
): string {
  if (field.key !== undefined) return String(field.key);
  if (Array.isArray(field.name)) return field.name.join('.');
  return String(field.name ?? index);
}

function getValueByNamePath(values: object, name: SchemaFormField<object>['name']) {
  const path = Array.isArray(name) ? name : [name];
  return path.reduce<unknown>((current, key) => {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string | number, unknown>)[key as string | number];
  }, values);
}

export function applySchemaTransforms<
  Values extends SchemaFormValues,
  SubmitValues extends SchemaFormValues = Values,
>(
  values: Values,
  groups: SchemaFormGroup<Values, SubmitValues>[],
): SubmitValues {
  const result = { ...values } as Record<string, unknown>;
  groups.flatMap((group) => group.fields).forEach((field) => {
    if (!field.transform) return;
    const transformed = field.transform(getValueByNamePath(values, field.name), values);
    if (typeof field.name === 'string') delete result[field.name];
    Object.assign(result, transformed);
  });
  return result as SubmitValues;
}

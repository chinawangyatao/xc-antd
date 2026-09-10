import { TextField } from '../TextField';
import type { HocTableNewRowFieldConfig } from './types';
import { extractHocTableFieldValue } from './utils';

export interface HocTableEditableCellProps {
  value: unknown;
  title: string;
  config: HocTableNewRowFieldConfig;
  error?: string;
  onChange: (value: unknown) => void;
}

export function HocTableEditableCell({
  value,
  title,
  config,
  error,
  onChange,
}: HocTableEditableCellProps) {
  if (config.readonly) {
    return (
      <span className="xc-hoc-table__readonly-text">
        {config.placeholder ?? (value == null || value === '' ? '-' : String(value))}
      </span>
    );
  }

  const fieldProps = {
    size: 'small' as const,
    style: { width: '100%' },
    allowClear: true,
    ...config.fieldProps,
    ...(error ? { status: 'error' as const } : {}),
  };
  const commonProps = {
    mode: 'edit' as const,
    value,
    placeholder: config.placeholder ?? `请输入${title}`,
    onChange: (nextValue: unknown) => onChange(
      extractHocTableFieldValue(nextValue, config.valueType),
    ),
    fieldProps,
  };

  return (
    <div className="xc-hoc-table__editable-cell">
      {config.valueType === 'date' || config.valueType === 'dateTime' ? (
        <TextField
          {...commonProps}
          valueType={config.valueType}
          placeholder={config.placeholder ?? `请选择${title}`}
        />
      ) : config.valueType === 'select' ? (
        <TextField
          {...commonProps}
          valueType="select"
          valueEnum={config.valueEnum}
          placeholder={config.placeholder ?? `请选择${title}`}
        />
      ) : (
        <TextField {...commonProps} valueType={config.valueType} />
      )}
      {error && <span className="xc-hoc-table__field-error">{error}</span>}
    </div>
  );
}

export default HocTableEditableCell;

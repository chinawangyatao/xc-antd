import { Badge, Space } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import React from 'react';
import type { ProFieldValueEnumType, ProSchemaValueEnumMap } from './typing';

function getType(obj: any) {
  // @ts-ignore
  const type = Object.prototype.toString
    .call(obj)
    .match(/^\[object (.*)\]$/)[1]
    .toLowerCase();
  if (type === 'string' && typeof obj === 'object') return 'object';
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  return type;
}

type StatusProps = {
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
};

export const ProFieldBadgeColor: React.FC<StatusProps & { color: string }> = ({
  color,
  children,
}) => <Badge color={color} text={children} />;

export const objectToMap = (
  value: ProFieldValueEnumType | undefined,
): ProSchemaValueEnumMap => {
  if (getType(value) === 'map') {
    return value as ProSchemaValueEnumMap;
  }
  return new Map(Object.entries(value || {}));
};

const TableStatus: {
  Success: React.FC<StatusProps>;
  Error: React.FC<StatusProps>;
  Processing: React.FC<StatusProps>;
  Default: React.FC<StatusProps>;
  Warning: React.FC<StatusProps>;
  success: React.FC<StatusProps>;
  error: React.FC<StatusProps>;
  processing: React.FC<StatusProps>;
  default: React.FC<StatusProps>;
  warning: React.FC<StatusProps>;
} = {
  Success: ({ children }) => <Badge status="success" text={children} />,
  Error: ({ children }) => <Badge status="error" text={children} />,
  Default: ({ children }) => <Badge status="default" text={children} />,
  Processing: ({ children }) => <Badge status="processing" text={children} />,
  Warning: ({ children }) => <Badge status="warning" text={children} />,
  success: ({ children }) => <Badge status="success" text={children} />,
  error: ({ children }) => <Badge status="error" text={children} />,
  default: ({ children }) => <Badge status="default" text={children} />,
  processing: ({ children }) => <Badge status="processing" text={children} />,
  warning: ({ children }) => <Badge status="warning" text={children} />,
};

type ProFieldStatusType =
  | 'success'
  | 'warning'
  | 'error'
  | 'default'
  | 'processing'
  | 'Success'
  | 'Error'
  | 'Processing'
  | 'Default'
  | 'Warning';

export const proFieldParsingText = (
  text: string | number | (string | number)[],
  valueEnumParams: ProFieldValueEnumType,
  key?: number | string,
): React.ReactNode => {
  if (Array.isArray(text)) {
    return (
      <Space key={key} separator="," size={2} wrap>
        {text.map((value, index) =>
          proFieldParsingText(value, valueEnumParams, index),
        )}
      </Space>
    );
  }

  const valueEnum = objectToMap(valueEnumParams);

  if (!valueEnum.has(text) && !valueEnum.has(`${text}`)) {
    // @ts-ignore
    return text?.label || text;
  }

  const domText = (valueEnum.get(text) || valueEnum.get(`${text}`)) as {
    text: ReactNode;
    status: ProFieldStatusType;
    color?: string;
  };

  if (!domText) {
    // @ts-ignore
    return <React.Fragment key={key}>{text?.label || text}</React.Fragment>;
  }

  const { status, color } = domText;

  const Status = TableStatus[status || 'Init'];

  if (Status) {
    return <Status key={key}>{domText.text}</Status>;
  }

  if (color) {
    return (
      <ProFieldBadgeColor key={key} color={color}>
        {domText.text}
      </ProFieldBadgeColor>
    );
  }
  return (
    <React.Fragment key={key}>
      {domText.text || (domText as any as React.ReactNode)}
    </React.Fragment>
  );
};

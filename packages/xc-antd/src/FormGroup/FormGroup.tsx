import { Row } from 'antd';
import type { RowProps } from 'antd';
import React from 'react';
import './style.css';

export interface FormGroupProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  gutter?: RowProps['gutter'];
  justify?: RowProps['justify'];
  align?: RowProps['align'];
}

export function FormGroup({
  title,
  extra,
  gutter = 16,
  justify = 'start',
  align,
  className,
  children,
  ...sectionProps
}: FormGroupProps) {
  const rootClassName = ['xc-form-group', className].filter(Boolean).join(' ');

  return (
    <section {...sectionProps} className={rootClassName}>
      {(title !== undefined || extra !== undefined) && (
        <header className="xc-form-group__header">
          {title !== undefined && (
            <div className="xc-form-group__title">{title}</div>
          )}
          {extra !== undefined && (
            <div className="xc-form-group__extra">{extra}</div>
          )}
        </header>
      )}
      <div className="xc-form-group__body">
        <Row gutter={gutter} justify={justify} align={align}>
          {children}
        </Row>
      </div>
    </section>
  );
}

export default FormGroup;

import { Tooltip } from 'antd';
import type { ReactNode } from 'react';

/** 复用原生 Tooltip 提供截断文本全文，列宽与是否截断仍由 columns 决定。 */
export function TableCellText({ children, title }: { children: ReactNode; title: ReactNode }) {
  return (
    <Tooltip title={title} placement="topLeft">
      <span className="xc-table-cell-text">{children}</span>
    </Tooltip>
  );
}

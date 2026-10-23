import type { ColProps } from 'antd';

export const searchBreakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
export type SearchBreakpoint = typeof searchBreakpoints[number];

/** 保留原生 Col 配置语义，将窗口断点改为查询容器断点，适配 Splitter / 微应用。 */
export function getContainerColProps(
  colProps: ColProps,
  width: number,
  breakpoints: Record<SearchBreakpoint, number>,
): ColProps {
  const { xs, sm, md, lg, xl, xxl, ...baseProps } = colProps;
  const responsive = { xs, sm, md, lg, xl, xxl };
  let resolved: ColProps = { span: 24, ...baseProps };
  for (const breakpoint of searchBreakpoints) {
    const value = responsive[breakpoint];
    if (value === undefined || (breakpoint !== 'xs' && width < breakpoints[breakpoint])) continue;
    resolved = {
      ...resolved,
      ...(typeof value === 'object' ? value : { span: value }),
    };
  }
  return resolved;
}

import type { CSSInterpolation } from '@ant-design/cssinjs';
import { theme as antdTheme } from 'antd';
import type { GlobalToken } from 'antd/lib/theme/interface';

/**
 * 独立精简版 useStyle：
 * - 不依赖 ProProvider / ProConfigContext
 * - 不注册 CSS-in-JS 样式（跳过 useStyleRegister）
 * - 只返回 hashId 供 className 拼接
 */
export type GenerateStyle<
  ComponentToken extends object = GlobalToken,
  ReturnType = CSSInterpolation,
> = (token: ComponentToken, ...rest: any[]) => ReturnType;

export type ProAliasToken = GlobalToken & {
  proComponentsCls?: string;
  antCls?: string;
};

export const proTheme = antdTheme as any;

export type UseStyleResult = {
  wrapSSR: (node: React.ReactElement) => React.ReactElement;
  hashId: string;
};

/**
 * 精简版 useStyle：跳过 CSS-in-JS 注册，仅返回 token 和空 hashId。
 * 组件样式由 antd 自身或消费方自定义 CSS 覆盖。
 */
export function useStyle(
  _componentName: string,
  _styleFn?: (token: ProAliasToken) => CSSInterpolation,
): UseStyleResult {
  return {
    wrapSSR: (node: React.ReactElement) => node,
    hashId: '',
  };
}

import { theme } from 'antd';
import type { CSSProperties } from 'react';

/** 将当前 ConfigProvider 的真实 Token 映射给自定义 DOM，兼容嵌套主题及独立 portal。 */
export function useComponentTheme(): CSSProperties {
  const { token } = theme.useToken();
  return {
    '--xc-color-primary': token.colorPrimary,
    '--xc-color-primary-hover': token.colorPrimaryHover,
    '--xc-color-primary-active': token.colorPrimaryActive,
    '--xc-color-primary-bg': token.colorPrimaryBg,
    '--xc-color-primary-border': token.colorPrimaryBorder,
    '--xc-color-text': token.colorText,
    '--xc-color-text-secondary': token.colorTextSecondary,
    '--xc-color-text-tertiary': token.colorTextTertiary,
    '--xc-color-text-disabled': token.colorTextDisabled,
    '--xc-color-error': token.colorError,
    '--xc-color-warning-bg': token.colorWarningBg,
    '--xc-color-bg': token.colorBgContainer,
    '--xc-color-fill': token.colorFillSecondary,
    '--xc-color-hover': token.colorFillQuaternary,
    '--xc-color-border': token.colorBorder,
    '--xc-color-split': token.colorSplit,
    '--xc-shadow': token.boxShadow,
    '--xc-font-family': token.fontFamily,
    '--xc-font-size': `${token.fontSize}px`,
    '--xc-font-size-sm': `${token.fontSizeSM}px`,
    '--xc-font-size-lg': `${token.fontSizeLG}px`,
    '--xc-font-weight-strong': token.fontWeightStrong,
    '--xc-line-height': token.lineHeight,
    '--xc-radius': `${token.borderRadius}px`,
    '--xc-padding': `${token.padding}px`,
    '--xc-padding-lg': `${token.paddingLG}px`,
    '--xc-padding-sm': `${token.paddingSM}px`,
    '--xc-margin-xs': `${token.marginXS}px`,
    '--xc-margin': `${token.margin}px`,
    '--xc-control-height': `${token.controlHeight}px`,
    '--xc-scrollbar-thumb': token.colorTextQuaternary,
    '--xc-scrollbar-thumb-hover': token.colorTextTertiary,
  } as CSSProperties;
}

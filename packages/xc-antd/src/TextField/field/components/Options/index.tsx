import { ConfigProvider } from 'antd';
import React, { useContext, useImperativeHandle } from 'react';
import { theme as proTheme } from 'antd';
import type { ProFieldFC } from '../../types';

const addArrayKeys = (doms: React.ReactNode[]) =>
  doms.map((dom, index) => {
    if (!React.isValidElement(dom)) {
      return <React.Fragment key={index}>{dom}</React.Fragment>;
    }
    const element = dom as React.ReactElement<{ style?: React.CSSProperties }>;
    return React.cloneElement(element, {
      key: index,
      style: {
        ...element.props.style,
      },
    });
  });

/**
 * 一般用于放多个按钮
 *
 * @param
 */
const FieldOptions: ProFieldFC = (
  { text, mode: type, render, fieldProps },
  ref,
) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const className = getPrefixCls('pro-field-option');

  const { token } = proTheme.useToken();

  useImperativeHandle(ref, () => ({}));

  if (render) {
    const doms = render(
      text,
      { mode: type, ...fieldProps },
      <></>,
    ) as unknown as React.ReactNode[];

    if (!doms || doms?.length < 1 || !Array.isArray(doms)) {
      return null;
    }

    return (
      <div
        style={{
          display: 'flex',
          gap: token.margin,
          alignItems: 'center',
        }}
        className={className}
      >
        {addArrayKeys(doms)}
      </div>
    );
  }

  if (!text || !Array.isArray(text)) {
    if (!React.isValidElement(text)) {
      return null;
    }
    return text as React.JSX.Element;
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: token.margin,
        alignItems: 'center',
      }}
      className={className}
    >
      {addArrayKeys(text)}
    </div>
  );
};

export default React.forwardRef(FieldOptions);

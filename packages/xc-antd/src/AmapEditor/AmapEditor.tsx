import React from 'react';
import { Alert, Spin } from 'antd';
import type { AmapEditorProps, AmapEditorRef } from './types';
import './style.css';

const LazyAmapEditorCanvas = React.lazy(() => import('./AmapEditorCanvas'));

type AmapWindow = Window & {
  _AMapSecurityConfig?: {
    securityJsCode: string;
  };
};

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function AmapEditorState({ children }: { children: React.ReactNode }) {
  return <div className="xc-amap-editor__state">{children}</div>;
}

export const AmapEditor = React.forwardRef<AmapEditorRef, AmapEditorProps>(
  function AmapEditor({
    apiKey,
    securityJsCode,
    height = 420,
    className,
    style,
    ...props
  }, ref) {
    const rootStyle = { ...style, height };
    const rootClassName = joinClassNames('xc-amap-editor', className);

    if (!apiKey.trim()) {
      return (
        <div className={rootClassName} style={rootStyle}>
          <AmapEditorState>
            <Alert
              type="warning"
              showIcon
              title="未配置高德地图 Key"
              description="请通过 apiKey 传入 Web 端 JSAPI Key。"
            />
          </AmapEditorState>
        </div>
      );
    }

    if (typeof window === 'undefined') {
      return (
        <div className={rootClassName} style={rootStyle}>
          <AmapEditorState>
            <Spin aria-label="正在加载高德地图" />
          </AmapEditorState>
        </div>
      );
    }

    if (securityJsCode) {
      // The AMap loader requires this global to exist before its module is imported.
      // eslint-disable-next-line react-hooks/immutability
      (window as AmapWindow)._AMapSecurityConfig = { securityJsCode };
    }

    return (
      <div className={rootClassName} style={rootStyle}>
        <React.Suspense
          fallback={(
            <AmapEditorState>
              <Spin aria-label="正在加载高德地图" />
            </AmapEditorState>
          )}
        >
          <LazyAmapEditorCanvas
            {...props}
            apiKey={apiKey}
            securityJsCode={securityJsCode}
            ref={ref}
          />
        </React.Suspense>
      </div>
    );
  },
);

AmapEditor.displayName = 'AmapEditor';

export default AmapEditor;

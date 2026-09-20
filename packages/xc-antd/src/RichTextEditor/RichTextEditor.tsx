import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import {
  DEFAULT_RICH_TEXT_EDITOR_FORMATS,
  resolveRichTextEditorModules,
} from './config';
import type { RichTextEditorProps } from './types';
import 'react-quill-new/dist/quill.snow.css';
import './style.css';

const ReactQuill = lazy(() => import('react-quill-new'));

type RichTextEditorStyle = React.CSSProperties & {
  '--xc-rich-text-editor-min-height'?: string;
};

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function toCssSize(value: RichTextEditorProps['minHeight']) {
  return typeof value === 'number' ? `${value}px` : value;
}

export function RichTextEditor({
  value,
  defaultValue = '',
  onChange,
  placeholder = '请输入内容',
  readOnly = false,
  disabled = false,
  status,
  minHeight = 180,
  modules,
  formats = DEFAULT_RICH_TEXT_EDITOR_FORMATS,
  editorProps,
  className,
  style,
}: RichTextEditorProps) {
  const effectiveReadOnly = readOnly || disabled;
  const valueProps = value === undefined ? { defaultValue } : { value };
  const rootStyle: RichTextEditorStyle = {
    ...style,
    '--xc-rich-text-editor-min-height': toCssSize(minHeight),
  };

  return (
    <div
      className={joinClassNames(
        'xc-rich-text-editor',
        effectiveReadOnly && 'xc-rich-text-editor--read-only',
        disabled && 'xc-rich-text-editor--disabled',
        status && `xc-rich-text-editor--${status}`,
        className,
      )}
      style={rootStyle}
      aria-disabled={disabled || undefined}
    >
      <Suspense
        fallback={(
          <div
            className="xc-rich-text-editor__loading"
            role="status"
            aria-label="正在加载富文本编辑器"
          >
            <Spin size="small" />
          </div>
        )}
      >
        <ReactQuill
          {...editorProps}
          {...valueProps}
          className="xc-rich-text-editor__quill"
          theme="snow"
          placeholder={placeholder}
          readOnly={effectiveReadOnly}
          modules={resolveRichTextEditorModules(modules, effectiveReadOnly)}
          formats={formats}
          onChange={onChange}
          tabIndex={disabled ? -1 : editorProps?.tabIndex}
        />
      </Suspense>
    </div>
  );
}

export default RichTextEditor;

import type { ComponentProps, CSSProperties } from 'react';
import type ReactQuill from 'react-quill-new';

type ReactQuillProps = ComponentProps<typeof ReactQuill>;

export type RichTextEditorStatus = 'error' | 'warning';
export type RichTextEditorModules = NonNullable<ReactQuillProps['modules']>;
export type RichTextEditorChangeHandler = NonNullable<ReactQuillProps['onChange']>;

export type RichTextEditorPassThroughProps = Omit<
  ReactQuillProps,
  | 'className'
  | 'defaultValue'
  | 'formats'
  | 'modules'
  | 'onChange'
  | 'placeholder'
  | 'readOnly'
  | 'style'
  | 'theme'
  | 'value'
>;

export interface RichTextEditorProps {
  /** HTML content. Supplying value makes the editor controlled. */
  value?: string;
  /** Initial HTML content for uncontrolled usage. */
  defaultValue?: string;
  onChange?: RichTextEditorChangeHandler;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  status?: RichTextEditorStatus;
  minHeight?: CSSProperties['minHeight'];
  modules?: RichTextEditorModules;
  formats?: string[];
  editorProps?: RichTextEditorPassThroughProps;
  className?: string;
  style?: CSSProperties;
}

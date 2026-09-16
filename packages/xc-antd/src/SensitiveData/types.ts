import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
} from 'react';
import type { ImageProps } from 'antd';

export type SensitiveDataType =
  | 'phone'
  | 'number'
  | 'email'
  | 'image'
  | 'name'
  | 'key'
  | 'idCard'
  | 'id'
  | 'address'
  | 'bankCard'
  | 'text';

export type SensitiveDataRevealMode = 'local' | 'request';

export interface SensitiveDataRequestContext {
  signal: AbortSignal;
}

export interface SensitiveDataProps {
  /** local 模式下为原文，request 模式下为初始脱敏文本。 */
  value: string;
  type?: SensitiveDataType;
  revealMode?: SensitiveDataRevealMode;
  request?: (
    params: Record<string, unknown>,
    context: SensitiveDataRequestContext,
  ) => Promise<string>;
  requestParams?: Record<string, unknown>;
  maskCharacter?: string;
  mask?: (value: string) => string;
  defaultRevealed?: boolean;
  disabled?: boolean;
  onRevealChange?: (revealed: boolean) => void;
  onRequestError?: (error: Error) => void;

  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  placeholderImage?: ReactNode;
  preview?: boolean;
  imageProps?: Omit<ImageProps, 'height' | 'preview' | 'src' | 'width'>;
  textProps?: Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'children' | 'disabled' | 'onClick' | 'type'
  >;

  className?: string;
  style?: CSSProperties;
}

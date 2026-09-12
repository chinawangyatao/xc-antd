import type React from 'react';
import type { UploadFile, UploadProps } from 'antd';

export type ImageCropFormat = 'jpeg' | 'png' | 'webp';
export type ImageCropShape = 'rect' | 'round';

export interface ImageCropOptions {
  aspectRatio?: number;
  shape?: ImageCropShape;
  /** @deprecated Use shape="round". */
  round?: boolean;
  movable?: boolean;
  scalable?: boolean;
  rotatable?: boolean;
  /** Whether the crop stencil itself can move. */
  canMoveBox?: boolean;
  /** Locks the crop stencil size when true. */
  fixedBox?: boolean;
  quality?: number;
  format?: ImageCropFormat;
  outputWidth?: number;
  outputHeight?: number;
  fillColor?: string;
}

export interface ImageCropResult {
  file: File;
  originalFile: File;
  cropped: boolean;
}

export interface ImageCropDrawerProps {
  open: boolean;
  files: File[];
  options?: ImageCropOptions;
  title?: React.ReactNode;
  width?: number | string;
  onCancel: () => void;
  onComplete: (results: ImageCropResult[]) => void | Promise<void>;
}

export type ImageUploadFile<ResponseType = unknown> = UploadFile<ResponseType> & {
  isCropped?: boolean;
  originalName?: string;
};

export interface ImageUploadResolvedResult {
  name?: string;
  url?: string;
}

export interface ImageUploadRequestContext {
  signal: AbortSignal;
  onProgress: (percent: number) => void;
}

export interface ImageUploadProps<ResponseType = unknown> {
  value?: ImageUploadFile<ResponseType>[];
  defaultValue?: ImageUploadFile<ResponseType>[];
  onChange?: (files: ImageUploadFile<ResponseType>[]) => void;

  action?: string | ((file: File) => string | Promise<string>);
  customUpload?: (
    file: File,
    context: ImageUploadRequestContext,
  ) => Promise<ResponseType>;
  resolveResponse?: (
    response: ResponseType,
    file: File,
  ) => ImageUploadResolvedResult;
  headers?: Record<string, string>;
  data?: Record<string, unknown> | ((file: File) => Record<string, unknown> | Promise<Record<string, unknown>>);
  name?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  withCredentials?: boolean;
  concurrency?: number;

  multiple?: boolean;
  maxCount?: number;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
  listType?: UploadProps['listType'];
  autoUpload?: boolean;
  showTip?: boolean;
  tip?: React.ReactNode;
  trigger?: React.ReactNode;
  preview?: boolean;

  crop?: boolean | ImageCropOptions;
  autoUploadAfterCrop?: boolean;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  beforeRemove?: (
    file: ImageUploadFile<ResponseType>,
    files: ImageUploadFile<ResponseType>[],
  ) => boolean | Promise<boolean>;
  onPreview?: (file: ImageUploadFile<ResponseType>) => void;
  onRemove?: (file: ImageUploadFile<ResponseType>) => void;
  onExceed?: (files: File[]) => void;
  onUploadSuccess?: (
    response: ResponseType,
    file: File,
    files: ImageUploadFile<ResponseType>[],
  ) => void;
  onUploadError?: (error: Error, file: File) => void;
  onCropComplete?: (result: ImageCropResult) => void;
  onBatchCropComplete?: (results: ImageCropResult[]) => void;
  onCropCancel?: (files: File[]) => void;

  uploadProps?: Omit<
    UploadProps<ResponseType>,
    | 'accept'
    | 'action'
    | 'beforeUpload'
    | 'children'
    | 'customRequest'
    | 'data'
    | 'disabled'
    | 'fileList'
    | 'headers'
    | 'listType'
    | 'maxCount'
    | 'method'
    | 'multiple'
    | 'name'
    | 'onChange'
    | 'onPreview'
    | 'onRemove'
    | 'withCredentials'
  >;
  className?: string;
  style?: React.CSSProperties;
}

export interface ImageUploadRef {
  clearFiles: () => void;
  selectFiles: () => void;
  uploadPendingFiles: () => Promise<PromiseSettledResult<unknown>[]>;
}

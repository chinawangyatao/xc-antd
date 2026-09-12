import React from 'react';
import {
  Button,
  Image,
  message,
  Upload,
  type UploadFile,
  type UploadProps,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import { ImageCropDrawer } from './ImageCropDrawer';
import type {
  ImageCropOptions,
  ImageCropResult,
  ImageUploadFile,
  ImageUploadProps,
  ImageUploadRef,
  ImageUploadRequestContext,
} from './types';
import {
  closeImageCropSession,
  createImageCropSession,
  resolveImageUploadResponse,
  runWithConcurrency,
  settleImageCropSessionTransition,
  validateImageFile,
} from './utils';
import './style.css';

interface PendingFile {
  file: File;
  cropResult?: ImageCropResult;
}

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

function ImageUploadInner<ResponseType = unknown>(
  {
    value,
    defaultValue = [],
    onChange,
    action,
    customUpload,
    resolveResponse,
    headers,
    data,
    name = 'file',
    method = 'POST',
    withCredentials,
    concurrency = 3,
    multiple = false,
    maxCount = 5,
    maxSizeMB = 5,
    accept = DEFAULT_ACCEPT,
    disabled = false,
    listType = 'picture-card',
    autoUpload = true,
    showTip = true,
    tip,
    trigger,
    preview = true,
    crop = false,
    autoUploadAfterCrop = true,
    beforeUpload,
    beforeRemove,
    onPreview,
    onRemove,
    onExceed,
    onUploadSuccess,
    onUploadError,
    onCropComplete,
    onBatchCropComplete,
    onCropCancel,
    uploadProps,
    className,
    style,
  }: ImageUploadProps<ResponseType>,
  ref: React.ForwardedRef<ImageUploadRef>,
) {
  const [messageApi, messageContextHolder] = message.useMessage();
  const [innerFiles, setInnerFiles] = React.useState<ImageUploadFile<ResponseType>[]>(
    defaultValue,
  );
  const [cropSession, setCropSession] = React.useState(() =>
    createImageCropSession([]),
  );
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState('');
  const rootRef = React.useRef<HTMLDivElement>(null);
  const latestFiles = React.useRef<ImageUploadFile<ResponseType>[]>(value ?? innerFiles);
  const uidMap = React.useRef<WeakMap<File, string>>(new WeakMap());
  const uidCounter = React.useRef(1);
  const localUrls = React.useRef<Map<string, string>>(new Map());
  const pendingFiles = React.useRef<Map<string, PendingFile>>(new Map());
  const abortControllers = React.useRef<Map<string, AbortController>>(new Map());
  const mergedFiles = value ?? innerFiles;
  const cropFiles = cropSession.files;

  React.useEffect(() => {
    latestFiles.current = mergedFiles;
  }, [mergedFiles]);

  const commitFiles = React.useCallback((
    update: (
      current: ImageUploadFile<ResponseType>[],
    ) => ImageUploadFile<ResponseType>[],
  ) => {
    const next = update(latestFiles.current);
    latestFiles.current = next;
    if (value === undefined) setInnerFiles(next);
    onChange?.(next);
    return next;
  }, [onChange, value]);

  const getUid = React.useCallback((file: File) => {
    const rcUid = (file as Partial<RcFile>).uid;
    if (rcUid) return rcUid;
    const existing = uidMap.current.get(file);
    if (existing) return existing;
    const uid = `xc-image-${Date.now()}-${uidCounter.current}`;
    uidCounter.current += 1;
    uidMap.current.set(file, uid);
    return uid;
  }, []);

  const getLocalUrl = React.useCallback((file: File, uid: string) => {
    const existing = localUrls.current.get(uid);
    if (existing) return existing;
    const url = URL.createObjectURL(file);
    localUrls.current.set(uid, url);
    return url;
  }, []);

  const releaseLocalUrl = React.useCallback((uid: string) => {
    const url = localUrls.current.get(uid);
    if (url) URL.revokeObjectURL(url);
    localUrls.current.delete(uid);
  }, []);

  const createUploadFile = React.useCallback((
    file: File,
    status: ImageUploadFile<ResponseType>['status'],
    cropResult?: ImageCropResult,
  ): ImageUploadFile<ResponseType> => {
    const uid = getUid(file);
    const url = getLocalUrl(file, uid);
    return {
      uid,
      name: file.name,
      size: file.size,
      type: file.type,
      status,
      percent: status === 'uploading' ? 0 : 100,
      url,
      thumbUrl: url,
      originFileObj: file as RcFile,
      isCropped: cropResult?.cropped,
      originalName: cropResult?.originalFile.name,
    };
  }, [getLocalUrl, getUid]);

  const upsertFile = React.useCallback((
    file: File,
    status: ImageUploadFile<ResponseType>['status'],
    cropResult?: ImageCropResult,
  ) => {
    const nextFile = createUploadFile(file, status, cropResult);
    commitFiles((current) => {
      const index = current.findIndex((item) => item.uid === nextFile.uid);
      if (index < 0) return [...current, nextFile];
      return current.map((item) => item.uid === nextFile.uid
        ? { ...item, ...nextFile }
        : item);
    });
    return nextFile.uid;
  }, [commitFiles, createUploadFile]);

  const executeUpload = React.useCallback(async (
    file: File,
    context: ImageUploadRequestContext,
  ): Promise<ResponseType> => {
    if (customUpload) return customUpload(file, context);
    if (!action) {
      throw new Error('请配置 action 或 customUpload');
    }
    const target = typeof action === 'function' ? await action(file) : action;
    const extraData = typeof data === 'function' ? await data(file) : data;
    const formData = new FormData();
    formData.append(name, file);
    Object.entries(extraData ?? {}).forEach(([key, fieldValue]) => {
      if (fieldValue === undefined || fieldValue === null) return;
      formData.append(key, fieldValue instanceof Blob ? fieldValue : String(fieldValue));
    });
    const response = await fetch(target, {
      method,
      headers,
      body: formData,
      credentials: withCredentials ? 'include' : 'same-origin',
      signal: context.signal,
    });
    if (!response.ok) throw new Error(`上传失败（${response.status}）`);
    const contentType = response.headers.get('content-type') ?? '';
    return (contentType.includes('application/json')
      ? await response.json()
      : await response.text()) as ResponseType;
  }, [action, customUpload, data, headers, method, name, withCredentials]);

  const uploadOne = React.useCallback(async (
    file: File,
    cropResult?: ImageCropResult,
  ): Promise<ResponseType> => {
    const uid = upsertFile(file, 'uploading', cropResult);
    const controller = new AbortController();
    abortControllers.current.set(uid, controller);
    try {
      const response = await executeUpload(file, {
        signal: controller.signal,
        onProgress: (percent) => {
          const normalized = Math.max(0, Math.min(100, percent));
          commitFiles((current) => current.map((item) =>
            item.uid === uid ? { ...item, percent: normalized } : item,
          ));
        },
      });
      const resolved = resolveResponse?.(response, file)
        ?? resolveImageUploadResponse(response);
      const nextFiles = commitFiles((current) => current.map((item) => {
        if (item.uid !== uid) return item;
        return {
          ...item,
          name: resolved.name ?? item.name,
          url: resolved.url ?? item.url,
          thumbUrl: resolved.url ?? item.thumbUrl,
          status: 'done',
          percent: 100,
          response,
        };
      }));
      if (resolved.url && resolved.url !== localUrls.current.get(uid)) {
        releaseLocalUrl(uid);
      }
      pendingFiles.current.delete(uid);
      onUploadSuccess?.(response, file, nextFiles);
      return response;
    } catch (error) {
      const uploadError = toError(error);
      if (uploadError.name !== 'AbortError') {
        commitFiles((current) => current.map((item) =>
          item.uid === uid ? { ...item, status: 'error', error: uploadError } : item,
        ));
        onUploadError?.(uploadError, file);
        void messageApi.error(`${file.name}：${uploadError.message}`);
      }
      throw uploadError;
    } finally {
      abortControllers.current.delete(uid);
    }
  }, [
    commitFiles,
    executeUpload,
    messageApi,
    onUploadError,
    onUploadSuccess,
    releaseLocalUrl,
    resolveResponse,
    upsertFile,
  ]);

  const uploadBatch = React.useCallback((items: PendingFile[]) =>
    runWithConcurrency(items, concurrency, (item) =>
      uploadOne(item.file, item.cropResult),
    ), [concurrency, uploadOne]);

  const addPendingFiles = React.useCallback((items: PendingFile[]) => {
    items.forEach((item) => {
      const uid = upsertFile(item.file, 'done', item.cropResult);
      pendingFiles.current.set(uid, item);
    });
  }, [upsertFile]);

  const processSelectedFiles = React.useCallback(async (selectedFiles: File[]) => {
    if (cropFiles.length > 0) {
      void messageApi.warning('请先完成当前图片裁剪');
      return;
    }
    const filesToValidate = multiple ? selectedFiles : selectedFiles.slice(0, 1);
    const validFiles: File[] = [];
    for (const file of filesToValidate) {
      const validationError = validateImageFile(file, { accept, maxSizeMB });
      if (validationError) {
        void messageApi.error(validationError);
        continue;
      }
      if (beforeUpload) {
        try {
          if (await beforeUpload(file) === false) continue;
        } catch (error) {
          const validationError = toError(error);
          void messageApi.error(`${file.name}：${validationError.message}`);
          continue;
        }
      }
      validFiles.push(file);
    }
    if (validFiles.length === 0) return;
    if (latestFiles.current.length + validFiles.length > maxCount) {
      void messageApi.error(`最多上传 ${maxCount} 张图片`);
      onExceed?.(validFiles);
      return;
    }

    if (crop) {
      setCropSession(createImageCropSession(validFiles));
      return;
    }
    const pending = validFiles.map((file) => ({ file }));
    if (autoUpload) await uploadBatch(pending);
    else addPendingFiles(pending);
  }, [
    accept,
    addPendingFiles,
    autoUpload,
    beforeUpload,
    crop,
    cropFiles.length,
    maxCount,
    maxSizeMB,
    messageApi,
    multiple,
    onExceed,
    uploadBatch,
  ]);

  const handleBeforeUpload: NonNullable<UploadProps<ResponseType>['beforeUpload']> = (
    file,
    selectedFiles,
  ) => {
    if (file.uid === selectedFiles[0]?.uid) {
      void processSelectedFiles(selectedFiles);
    }
    return Upload.LIST_IGNORE;
  };

  const handleRemove = async (file: ImageUploadFile<ResponseType>) => {
    if (beforeRemove && await beforeRemove(file, latestFiles.current) === false) {
      return false;
    }
    abortControllers.current.get(file.uid)?.abort();
    abortControllers.current.delete(file.uid);
    pendingFiles.current.delete(file.uid);
    releaseLocalUrl(file.uid);
    commitFiles((current) => current.filter((item) => item.uid !== file.uid));
    onRemove?.(file);
    return true;
  };

  const clearFiles = React.useCallback(() => {
    abortControllers.current.forEach((controller) => controller.abort());
    abortControllers.current.clear();
    pendingFiles.current.clear();
    localUrls.current.forEach((url) => URL.revokeObjectURL(url));
    localUrls.current.clear();
    commitFiles(() => []);
  }, [commitFiles]);

  const uploadPendingFiles = React.useCallback(() =>
    uploadBatch(Array.from(pendingFiles.current.values())), [uploadBatch]);

  React.useImperativeHandle(ref, () => ({
    clearFiles,
    selectFiles: () => rootRef.current?.querySelector<HTMLInputElement>(
      'input[type="file"]',
    )?.click(),
    uploadPendingFiles,
  }), [clearFiles, uploadPendingFiles]);

  React.useEffect(() => () => {
    abortControllers.current.forEach((controller) => controller.abort());
    localUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const cropOptions: ImageCropOptions = typeof crop === 'object' ? crop : {};
  const limitReached = mergedFiles.length >= maxCount;
  const showUploadList = typeof uploadProps?.showUploadList === 'object'
    ? { ...uploadProps.showUploadList, showPreviewIcon: preview }
    : uploadProps?.showUploadList ?? true;
  const defaultTrigger = listType === 'picture-card' || listType === 'picture-circle'
    ? (
      <div className="xc-image-upload__trigger">
        <PlusOutlined />
        <span>上传图片</span>
      </div>
    )
    : <Button icon={<UploadOutlined />}>上传图片</Button>;

  return (
    <div
      ref={rootRef}
      className={joinClassNames(
        'xc-image-upload',
        limitReached && 'is-limit-reached',
        className,
      )}
      style={style}
    >
      {messageContextHolder}
      <Upload<ResponseType>
        {...uploadProps}
        accept={accept}
        disabled={disabled}
        fileList={mergedFiles}
        listType={listType}
        maxCount={maxCount}
        multiple={multiple}
        name={name}
        showUploadList={showUploadList}
        beforeUpload={handleBeforeUpload}
        onRemove={handleRemove}
        onPreview={(file: UploadFile<ResponseType>) => {
          onPreview?.(file);
          if (!preview) return;
          const url = file.url ?? file.thumbUrl;
          if (!url) return;
          setPreviewImage(url);
          setPreviewOpen(true);
        }}
      >
        {!limitReached && (trigger ?? defaultTrigger)}
      </Upload>

      {showTip && (
        <div className="xc-image-upload__tip">
          {tip ?? (
            <>
              支持 {accept.replaceAll('image/', '').replaceAll(',', ' / ')}，
              单张不超过 <strong>{maxSizeMB} MB</strong>，
              最多 <strong>{maxCount}</strong> 张
            </>
          )}
        </div>
      )}

      {previewImage && (
        <Image
          className="xc-image-upload__preview-image"
          src={previewImage}
          preview={{
            open: previewOpen,
            onOpenChange: setPreviewOpen,
          }}
        />
      )}

      {cropFiles.length > 0 && (
        <ImageCropDrawer
          open={cropSession.open}
          files={cropFiles}
          options={cropOptions}
          afterOpenChange={(open) => {
            setCropSession((session) =>
              settleImageCropSessionTransition(session, open),
            );
          }}
          onCancel={() => {
            onCropCancel?.(cropFiles);
            setCropSession(closeImageCropSession);
          }}
          onComplete={async (results) => {
            results
              .filter((result) => result.cropped)
              .forEach((result) => onCropComplete?.(result));
            onBatchCropComplete?.(results);
            setCropSession(closeImageCropSession);
            const pending = results.map((result) => ({
              file: result.file,
              cropResult: result,
            }));
            if (autoUploadAfterCrop) await uploadBatch(pending);
            else addPendingFiles(pending);
          }}
        />
      )}
    </div>
  );
}

export const ImageUpload = React.forwardRef(ImageUploadInner) as <ResponseType = unknown>(
  props: ImageUploadProps<ResponseType> & React.RefAttributes<ImageUploadRef>,
) => React.ReactElement;

export default ImageUpload;

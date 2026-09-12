import React from 'react';
import {
  Button,
  Drawer,
  Dropdown,
  Empty,
  message,
  Space,
  Tooltip,
} from 'antd';
import {
  DownOutlined,
  ReloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import {
  CircleStencil,
  Cropper,
  CropperPreview,
  RectangleStencil,
  type CropperPreviewRef,
  type CropperRef,
} from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import type {
  ImageCropDrawerProps,
  ImageCropOptions,
  ImageCropResult,
} from './types';
import { createCroppedImageFile } from './utils';

interface CropSource {
  file: File;
  url: string;
}

interface CropSize {
  width: number;
  height: number;
}

const aspectRatios = [
  { key: 'free', label: '自由', value: undefined },
  { key: '1:1', label: '1:1', value: 1 },
  { key: '4:3', label: '4:3', value: 4 / 3 },
  { key: '3:2', label: '3:2', value: 3 / 2 },
  { key: '16:9', label: '16:9', value: 16 / 9 },
  { key: '3:4', label: '3:4', value: 3 / 4 },
  { key: '2:3', label: '2:3', value: 2 / 3 },
  { key: '9:16', label: '9:16', value: 9 / 16 },
] as const;

function findAspectLabel(value: number | undefined) {
  if (value === undefined) return '自由';
  return aspectRatios.find((item) =>
    item.value !== undefined && Math.abs(item.value - value) < 0.001,
  )?.label ?? value.toFixed(2);
}

function getCanvasOptions(options: ImageCropOptions) {
  return {
    ...(options.outputWidth ? { width: options.outputWidth } : {}),
    ...(options.outputHeight ? { height: options.outputHeight } : {}),
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high' as const,
    ...(options.fillColor ? { fillColor: options.fillColor } : {}),
  };
}

export function ImageCropDrawer({
  open,
  files,
  options = {},
  title = '图片裁剪',
  width = 960,
  onCancel,
  onComplete,
}: ImageCropDrawerProps) {
  const [messageApi, messageContextHolder] = message.useMessage();
  const [sources, setSources] = React.useState<CropSource[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [aspectRatio, setAspectRatio] = React.useState(options.aspectRatio);
  const [cropSize, setCropSize] = React.useState<CropSize>();
  const [ready, setReady] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [completedIndexes, setCompletedIndexes] = React.useState<Set<number>>(new Set());
  const cropperRef = React.useRef<CropperRef>(null);
  const previewRef = React.useRef<CropperPreviewRef>(null);
  const resultsRef = React.useRef<Map<number, ImageCropResult>>(new Map());

  React.useEffect(() => {
    const nextSources = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    // Object URLs are external resources; reset the crop session when they change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSources(nextSources);
    setCurrentIndex(0);
    setAspectRatio(options.aspectRatio);
    setCropSize(undefined);
    setReady(false);
    setCompletedIndexes(new Set());
    resultsRef.current = new Map();
    return () => nextSources.forEach((source) => URL.revokeObjectURL(source.url));
  }, [files, options.aspectRatio]);

  const currentSource = sources[currentIndex];
  const round = options.shape === 'round' || options.round === true;
  const stencilProps = {
    ...(round || aspectRatio === undefined ? {} : { aspectRatio }),
    movable: options.canMoveBox !== false,
    resizable: options.fixedBox !== true,
    grid: true,
  };

  const advance = async (result: ImageCropResult) => {
    const nextResults = new Map(resultsRef.current);
    nextResults.set(currentIndex, result);
    resultsRef.current = nextResults;
    setCompletedIndexes((current) => new Set([...current, currentIndex]));

    if (currentIndex < sources.length - 1) {
      setReady(false);
      setCropSize(undefined);
      setCurrentIndex((index) => index + 1);
      return;
    }

    const results = sources.map((source, index) => nextResults.get(index) ?? {
      file: source.file,
      originalFile: source.file,
      cropped: false,
    });
    await onComplete(results);
  };

  const cropCurrent = async () => {
    if (!currentSource || !cropperRef.current) return;
    setProcessing(true);
    try {
      const canvas = cropperRef.current.getCanvas(getCanvasOptions(options));
      if (!canvas) throw new Error('裁剪器尚未准备完成');
      const file = await createCroppedImageFile(canvas, currentSource.file, options);
      setProcessing(false);
      await advance({ file, originalFile: currentSource.file, cropped: true });
    } catch (error) {
      setProcessing(false);
      void messageApi.error(error instanceof Error ? error.message : '裁剪图片失败');
    }
  };

  const skipCurrent = async () => {
    if (!currentSource) return;
    await advance({
      file: currentSource.file,
      originalFile: currentSource.file,
      cropped: false,
    });
  };

  const ratioItems = aspectRatios.map((ratio) => ({
    key: ratio.key,
    label: ratio.label,
    onClick: () => setAspectRatio(ratio.value),
  }));

  return (
    <Drawer
      rootClassName="xc-image-crop-drawer-root"
      className="xc-image-crop-drawer"
      title={title}
      open={open}
      size={width}
      destroyOnHidden
      keyboard={false}
      mask={{ closable: false }}
      onClose={onCancel}
      footer={(
        <div className="xc-image-crop-drawer__footer">
          <span>
            {sources.length > 0 ? `${currentIndex + 1} / ${sources.length}` : '0 / 0'}
          </span>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            {sources.length > 1 && (
              <Button disabled={processing} onClick={() => void skipCurrent()}>
                跳过
              </Button>
            )}
            <Button
              type="primary"
              loading={processing}
              disabled={!ready || !currentSource}
              onClick={() => void cropCurrent()}
            >
              {currentIndex < sources.length - 1 ? '应用并下一张' : '完成裁剪'}
            </Button>
          </Space>
        </div>
      )}
    >
      {messageContextHolder}
      {!currentSource ? (
        <Empty description="暂无待裁剪图片" />
      ) : (
        <div className="xc-image-crop-drawer__content">
          <div className="xc-image-crop-drawer__editor">
            <div className="xc-image-crop-drawer__cropper-wrap">
              <Cropper
                ref={cropperRef}
                src={currentSource.url}
                className="xc-image-crop-drawer__cropper"
                stencilComponent={round ? CircleStencil : RectangleStencil}
                stencilProps={stencilProps}
                backgroundWrapperProps={{
                  moveImage: options.movable !== false,
                  scaleImage: options.scalable !== false,
                  rotateImage: options.rotatable !== false,
                }}
                checkOrientation
                transitions
                onReady={(cropper) => {
                  setReady(true);
                  previewRef.current?.update(cropper);
                }}
                onUpdate={(cropper) => {
                  const coordinates = cropper.getCoordinates();
                  if (coordinates) {
                    setCropSize({
                      width: Math.round(coordinates.width),
                      height: Math.round(coordinates.height),
                    });
                  }
                  previewRef.current?.update(cropper);
                }}
                onError={() => {
                  setReady(false);
                  void messageApi.error('图片加载失败');
                }}
              />
            </div>

            <div className="xc-image-crop-drawer__toolbar">
              <Space wrap size={4}>
                <Tooltip title="放大">
                  <Button
                    aria-label="放大"
                    icon={<ZoomInOutlined />}
                    disabled={!ready || options.scalable === false}
                    onClick={() => cropperRef.current?.zoomImage(1.1)}
                  />
                </Tooltip>
                <Tooltip title="缩小">
                  <Button
                    aria-label="缩小"
                    icon={<ZoomOutOutlined />}
                    disabled={!ready || options.scalable === false}
                    onClick={() => cropperRef.current?.zoomImage(0.9)}
                  />
                </Tooltip>
                <Tooltip title="向左旋转">
                  <Button
                    aria-label="向左旋转"
                    icon={<RotateLeftOutlined />}
                    disabled={!ready || options.rotatable === false}
                    onClick={() => cropperRef.current?.rotateImage(-90)}
                  />
                </Tooltip>
                <Tooltip title="向右旋转">
                  <Button
                    aria-label="向右旋转"
                    icon={<RotateRightOutlined />}
                    disabled={!ready || options.rotatable === false}
                    onClick={() => cropperRef.current?.rotateImage(90)}
                  />
                </Tooltip>
                <Tooltip title="重置">
                  <Button
                    aria-label="重置"
                    icon={<ReloadOutlined />}
                    disabled={!ready}
                    onClick={() => cropperRef.current?.reset()}
                  />
                </Tooltip>
                {!round && (
                  <Dropdown menu={{ items: ratioItems }} trigger={['click']}>
                    <Button>
                      {findAspectLabel(aspectRatio)} <DownOutlined />
                    </Button>
                  </Dropdown>
                )}
              </Space>
            </div>
          </div>

          <aside className="xc-image-crop-drawer__preview-panel">
            <div>
              <div className="xc-image-crop-drawer__panel-title">预览效果</div>
              <div className={`xc-image-crop-drawer__preview${round ? ' is-round' : ''}`}>
                <CropperPreview ref={previewRef} cropper={cropperRef} />
              </div>
            </div>
            <dl className="xc-image-crop-drawer__info">
              <div><dt>文件名</dt><dd>{currentSource.file.name}</dd></div>
              <div><dt>裁剪尺寸</dt><dd>{cropSize ? `${cropSize.width} × ${cropSize.height}` : '-'}</dd></div>
              <div><dt>宽高比</dt><dd>{round ? '1:1' : findAspectLabel(aspectRatio)}</dd></div>
              <div><dt>输出格式</dt><dd>{(options.format ?? (round ? 'png' : 'jpeg')).toUpperCase()}</dd></div>
              <div><dt>输出质量</dt><dd>{Math.round((options.quality ?? 0.9) * 100)}%</dd></div>
            </dl>
          </aside>
        </div>
      )}

      {sources.length > 1 && (
        <div className="xc-image-crop-drawer__file-list">
          {sources.map((source, index) => (
            <button
              key={`${source.file.name}-${source.file.lastModified}-${index}`}
              type="button"
              className={[
                'xc-image-crop-drawer__file-item',
                index === currentIndex ? 'is-active' : '',
                completedIndexes.has(index) ? 'is-completed' : '',
              ].filter(Boolean).join(' ')}
              disabled={processing}
              onClick={() => {
                setReady(false);
                setCropSize(undefined);
                setCurrentIndex(index);
              }}
            >
              <img src={source.url} alt={source.file.name} />
              <span>{completedIndexes.has(index) ? '已完成' : index === currentIndex ? '当前' : '待处理'}</span>
            </button>
          ))}
        </div>
      )}
    </Drawer>
  );
}

export default ImageCropDrawer;

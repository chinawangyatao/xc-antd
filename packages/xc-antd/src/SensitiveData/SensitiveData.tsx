import {
  EyeInvisibleOutlined,
  LoadingOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { Image, Tooltip } from 'antd';
import React from 'react';
import { maskSensitiveValue } from './mask';
import type { SensitiveDataProps } from './types';
import './style.css';

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

export function SensitiveData({
  value,
  type = 'text',
  revealMode = 'local',
  request,
  requestParams = {},
  maskCharacter = '*',
  mask,
  defaultRevealed = false,
  disabled = false,
  onRevealChange,
  onRequestError,
  width = 88,
  height = 88,
  placeholderImage,
  preview = true,
  imageProps,
  textProps,
  className,
  style,
}: SensitiveDataProps) {
  const [revealed, setRevealed] = React.useState(
    defaultRevealed && revealMode === 'local',
  );
  const [requestedValue, setRequestedValue] = React.useState<string>();
  const [loading, setLoading] = React.useState(false);
  const abortController = React.useRef<AbortController | undefined>(undefined);
  const mounted = React.useRef(false);

  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    abortController.current?.abort();
    // A new source value starts masked and must not retain previously requested data.
    setRevealed(false);
    setRequestedValue(undefined);
    setLoading(false);
  }, [revealMode, value]);

  React.useEffect(() => () => {
    const controller = abortController.current;
    abortController.current = undefined;
    controller?.abort();
  }, []);

  const updateRevealed = (nextRevealed: boolean) => {
    setRevealed(nextRevealed);
    onRevealChange?.(nextRevealed);
  };

  const hide = () => {
    abortController.current?.abort();
    abortController.current = undefined;
    setLoading(false);
    setRequestedValue(undefined);
    updateRevealed(false);
  };

  const reveal = async () => {
    if (disabled || loading) return;
    if (revealMode === 'local') {
      updateRevealed(true);
      return;
    }
    if (!request) return;

    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;
    setLoading(true);
    try {
      const result = await request(requestParams, { signal: controller.signal });
      if (controller.signal.aborted) return;
      if (typeof result !== 'string') {
        throw new TypeError('SensitiveData request must resolve to a string.');
      }
      setRequestedValue(result);
      updateRevealed(true);
    } catch (error) {
      const requestError = toError(error);
      if (requestError.name !== 'AbortError') onRequestError?.(requestError);
    } finally {
      if (abortController.current === controller) {
        abortController.current = undefined;
        setLoading(false);
      }
    }
  };

  const toggleReveal = () => {
    if (revealed) hide();
    else void reveal();
  };

  const interactive = !disabled && (revealMode === 'local' || Boolean(request));
  const originalValue = revealMode === 'local' ? value : requestedValue;

  if (type === 'image') {
    const {
      className: imageClassName,
      ...restImageProps
    } = imageProps ?? {};
    return (
      <span
        className={joinClassNames('xc-sensitive-data', 'xc-sensitive-data--image', className)}
        style={style}
      >
        <span className="xc-sensitive-data__image" style={{ width, height }}>
          {revealed && originalValue ? (
            <Image
              {...restImageProps}
              className={joinClassNames('xc-sensitive-data__image-content', imageClassName)}
              src={originalValue}
              width="100%"
              height="100%"
              preview={preview}
            />
          ) : (
            <button
              type="button"
              className="xc-sensitive-data__image-placeholder"
              aria-label={loading ? '正在加载敏感图片' : '查看敏感图片'}
              disabled={!interactive || loading}
              onClick={toggleReveal}
            >
              {loading ? <LoadingOutlined spin /> : placeholderImage ?? <LockOutlined />}
            </button>
          )}
          {revealed && interactive && (
            <Tooltip title="隐藏图片">
              <button
                type="button"
                className="xc-sensitive-data__image-toggle"
                aria-label="隐藏敏感图片"
                onClick={(event) => {
                  event.stopPropagation();
                  hide();
                }}
              >
                <EyeInvisibleOutlined />
              </button>
            </Tooltip>
          )}
        </span>
      </span>
    );
  }

  const maskedValue = mask?.(value)
    ?? (revealMode === 'local'
      ? maskSensitiveValue(value, type, maskCharacter)
      : value);
  const displayValue = revealed && originalValue !== undefined
    ? originalValue
    : maskedValue;
  const { className: textClassName, ...restTextProps } = textProps ?? {};

  if (!interactive) {
    return (
      <span
        className={joinClassNames('xc-sensitive-data', 'xc-sensitive-data__text', textClassName, className)}
        style={{ ...style, ...textProps?.style }}
      >
        {displayValue}
      </span>
    );
  }

  return (
    <button
      {...restTextProps}
      type="button"
      className={joinClassNames('xc-sensitive-data', 'xc-sensitive-data__text', textClassName, className)}
      style={{ ...style, ...textProps?.style }}
      aria-label={textProps?.['aria-label']
        ?? (revealed ? '隐藏敏感信息' : '查看敏感信息')}
      aria-pressed={revealed}
      disabled={loading}
      onClick={toggleReveal}
    >
      {loading && <LoadingOutlined spin className="xc-sensitive-data__loading" />}
      <span className="xc-sensitive-data__text-content">{displayValue}</span>
    </button>
  );
}

export default SensitiveData;

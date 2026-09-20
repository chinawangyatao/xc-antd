import {
  CheckCircleFilled,
  QrcodeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button, Spin } from 'antd';
import {
  QRCodeCanvas as ReactQRCodeCanvas,
  QRCodeSVG as ReactQRCodeSVG,
} from 'qrcode.react';
import type { QRCodeProps, QRCodeStatus } from './types';
import './style.css';

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

function hasQRCodeValue(value: QRCodeProps['value']) {
  return Array.isArray(value)
    ? value.some((segment) => segment.length > 0)
    : value.length > 0;
}

function defaultStatusContent(
  status: Exclude<QRCodeStatus, 'active'>,
  onRefresh?: () => void,
) {
  if (status === 'loading') {
    return <Spin size="small" aria-label="正在生成二维码" />;
  }
  if (status === 'scanned') {
    return (
      <span className="xc-qr-code__status-message xc-qr-code__status-message--success">
        <CheckCircleFilled /> 已扫描
      </span>
    );
  }
  if (onRefresh) {
    return (
      <Button type="link" icon={<ReloadOutlined />} onClick={onRefresh}>
        点击刷新
      </Button>
    );
  }
  return <span className="xc-qr-code__status-message">二维码已失效</span>;
}

export function QRCode({
  value,
  renderType = 'svg',
  size = 160,
  level = 'M',
  bgColor = '#ffffff',
  fgColor = '#000000',
  marginSize = 2,
  title = '二维码',
  minVersion = 1,
  boostLevel = true,
  imageSettings,
  status = 'active',
  statusRender,
  onRefresh,
  bordered = true,
  svgProps,
  canvasProps,
  className,
  style,
}: QRCodeProps) {
  const commonProps = {
    value,
    size,
    level,
    bgColor,
    fgColor,
    marginSize,
    title,
    minVersion,
    boostLevel,
    imageSettings,
  };
  const hasValue = hasQRCodeValue(value);
  const overlayStatus = status === 'active' ? undefined : status;

  return (
    <div
      className={joinClassNames(
        'xc-qr-code',
        !bordered && 'xc-qr-code--borderless',
        className,
      )}
      style={style}
      aria-busy={status === 'loading' || undefined}
    >
      <div className="xc-qr-code__frame" style={{ background: bgColor }}>
        {hasValue ? (
          renderType === 'canvas' ? (
            <ReactQRCodeCanvas
              {...canvasProps}
              {...commonProps}
              className="xc-qr-code__image"
              aria-label={canvasProps?.['aria-label'] ?? title}
            />
          ) : (
            <ReactQRCodeSVG
              {...svgProps}
              {...commonProps}
              className="xc-qr-code__image"
              aria-label={svgProps?.['aria-label'] ?? title}
            />
          )
        ) : (
          <div
            className="xc-qr-code__empty"
            style={{ width: size, height: size }}
            role="status"
          >
            <QrcodeOutlined />
            <span>暂无二维码内容</span>
          </div>
        )}

        {hasValue && overlayStatus && (
          <div className="xc-qr-code__status">
            {statusRender
              ? statusRender(overlayStatus)
              : defaultStatusContent(overlayStatus, onRefresh)}
          </div>
        )}
      </div>
    </div>
  );
}

export default QRCode;

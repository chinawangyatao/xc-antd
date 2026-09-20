import type { ComponentProps, CSSProperties, ReactNode } from 'react';
import type {
  QRCodeCanvas as QRCodeCanvasComponent,
  QRCodeSVG as QRCodeSVGComponent,
} from 'qrcode.react';

type QRCodeSVGComponentProps = ComponentProps<typeof QRCodeSVGComponent>;
type QRCodeCanvasComponentProps = ComponentProps<typeof QRCodeCanvasComponent>;

type OwnedProps =
  | 'bgColor'
  | 'boostLevel'
  | 'className'
  | 'fgColor'
  | 'imageSettings'
  | 'level'
  | 'marginSize'
  | 'minVersion'
  | 'ref'
  | 'size'
  | 'style'
  | 'title'
  | 'value';

export type QRCodeRenderType = 'svg' | 'canvas';
export type QRCodeStatus = 'active' | 'loading' | 'expired' | 'scanned';
export type QRCodeLevel = NonNullable<QRCodeSVGComponentProps['level']>;
export type QRCodeImageSettings = NonNullable<
  QRCodeSVGComponentProps['imageSettings']
>;
export type QRCodeSVGProps = Omit<QRCodeSVGComponentProps, OwnedProps>;
export type QRCodeCanvasProps = Omit<QRCodeCanvasComponentProps, OwnedProps>;

export interface QRCodeProps {
  value: string | string[];
  renderType?: QRCodeRenderType;
  size?: number;
  level?: QRCodeLevel;
  bgColor?: string;
  fgColor?: string;
  marginSize?: number;
  title?: string;
  minVersion?: number;
  boostLevel?: boolean;
  imageSettings?: QRCodeImageSettings;
  status?: QRCodeStatus;
  statusRender?: (status: Exclude<QRCodeStatus, 'active'>) => ReactNode;
  onRefresh?: () => void;
  bordered?: boolean;
  svgProps?: QRCodeSVGProps;
  canvasProps?: QRCodeCanvasProps;
  className?: string;
  style?: CSSProperties;
}

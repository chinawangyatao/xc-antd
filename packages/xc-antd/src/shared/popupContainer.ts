import type { PopconfirmProps } from 'antd';

/** 使用宿主已有的浮层容器；没有 #mask-layer 时不覆盖 Ant Design 的挂载配置。 */
export function getMaskLayerPopupProps(
  ownerDocument: Pick<Document, 'getElementById'> | undefined = typeof document === 'undefined' ? undefined : document,
): Pick<PopconfirmProps, 'getPopupContainer'> {
  const container = ownerDocument?.getElementById('mask-layer');
  if (!container) return {};
  return { getPopupContainer: () => container };
}

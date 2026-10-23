import { ConfigProvider } from 'antd';
import type { DrawerProps } from 'antd';
import { useContext } from 'react';

/** 使用原生关闭按钮配置；显式关闭或自定义图标、禁用状态仍遵循调用方和宿主设置。 */
export function useDrawerClosable(closable?: DrawerProps['closable']): DrawerProps['closable'] {
  const { drawer } = useContext(ConfigProvider.ConfigContext);
  const resolved = closable ?? drawer?.closable;
  if (resolved === false) return false;
  return {
    placement: 'end',
    ...(typeof drawer?.closable === 'object' ? drawer.closable : {}),
    ...(typeof closable === 'object' ? closable : {}),
  };
}

import { Alert, Spin } from 'antd';
import type { ReactNode } from 'react';

interface PlayerStateProps {
  state: 'loading' | 'ready' | 'error';
  error?: Error;
  loadingRender?: ReactNode;
  errorRender?: (error: Error) => ReactNode;
}

export function PlayerState({
  state,
  error,
  loadingRender,
  errorRender,
}: PlayerStateProps) {
  if (state === 'ready') return null;
  if (state === 'error' && error) {
    return (
      <div className="xc-media-player__state">
        {errorRender
          ? errorRender(error)
          : <Alert type="error" showIcon title="播放器加载失败" description={error.message} />}
      </div>
    );
  }
  return (
    <div className="xc-media-player__state" role="status">
      {loadingRender ?? <Spin aria-label="正在加载播放器" />}
    </div>
  );
}

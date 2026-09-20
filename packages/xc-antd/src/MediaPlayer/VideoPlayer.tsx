import React from 'react';
import { PlayerState } from './PlayerState';
import type { MediaPlayerRef, VideoPlayerProps } from './types';
import { useXgplayer } from './useXgplayer';
import './style.css';

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const VideoPlayer = React.forwardRef<MediaPlayerRef, VideoPlayerProps>(
  function VideoPlayer({
    url,
    config,
    pluginConfig,
    events,
    onReady,
    onError,
    loadingRender,
    errorRender,
    aspectRatio = '16 / 9',
    className,
    style,
  }, ref) {
    const runtime = useXgplayer({
      kind: 'video',
      url,
      config,
      pluginConfig,
      events,
      onReady,
      onError,
    });

    React.useImperativeHandle(ref, () => ({
      getPlayer: () => runtime.playerRef.current,
      play: () => runtime.playerRef.current?.play(),
      pause: () => runtime.playerRef.current?.pause(),
      replay: () => runtime.playerRef.current?.replay(),
      switchURL: (nextUrl) => runtime.playerRef.current?.switchURL(nextUrl) ?? null,
    }), [runtime.playerRef]);

    return (
      <div
        className={joinClassNames('xc-media-player', 'xc-video-player', className)}
        style={{ ...style, aspectRatio }}
      >
        <div ref={runtime.mountRef} className="xc-media-player__mount" />
        <PlayerState
          state={runtime.state}
          error={runtime.error}
          loadingRender={loadingRender}
          errorRender={errorRender}
        />
      </div>
    );
  },
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

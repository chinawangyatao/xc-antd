import React from 'react';
import { PlayerState } from './PlayerState';
import type { MusicPlayerProps, MusicPlayerRef } from './types';
import { useXgplayer } from './useXgplayer';
import './style.css';

interface MusicPluginController {
  next?: () => void;
  prev?: () => void;
  setIndex?: (index: number) => void;
}

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

export const MusicPlayer = React.forwardRef<MusicPlayerRef, MusicPlayerProps>(
  function MusicPlayer({
    url,
    playlist,
    config,
    pluginConfig,
    events,
    onReady,
    onError,
    loadingRender,
    errorRender,
    height = 90,
    className,
    style,
  }, ref) {
    const runtime = useXgplayer({
      kind: 'music',
      url,
      playlist,
      config,
      pluginConfig,
      events,
      onReady,
      onError,
    });
    const getMusicPlugin = React.useCallback(() => (
      runtime.playerRef.current?.getPlugin('music') as MusicPluginController | undefined
    ), [runtime.playerRef]);

    React.useImperativeHandle(ref, () => ({
      getPlayer: () => runtime.playerRef.current,
      getMusicPlugin,
      play: () => runtime.playerRef.current?.play(),
      pause: () => runtime.playerRef.current?.pause(),
      replay: () => runtime.playerRef.current?.replay(),
      switchURL: (nextUrl) => runtime.playerRef.current?.switchURL(nextUrl) ?? null,
      next: () => getMusicPlugin()?.next?.(),
      prev: () => getMusicPlugin()?.prev?.(),
      setIndex: (index) => getMusicPlugin()?.setIndex?.(index),
    }), [getMusicPlugin, runtime.playerRef]);

    return (
      <div
        className={joinClassNames('xc-media-player', 'xc-music-player', className)}
        style={{ ...style, height }}
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

MusicPlayer.displayName = 'MusicPlayer';

export default MusicPlayer;

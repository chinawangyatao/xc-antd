import type { CSSProperties, ReactNode } from 'react';
import type Player from 'xgplayer';
import type { IPlayerOptions } from 'xgplayer';

export type XgplayerInstance = Player;
export type XgplayerSource = NonNullable<IPlayerOptions['url']>;
export type XgplayerExtension = 'auto' | 'native' | 'flv' | 'hls' | 'mp4';

export type XgplayerBuiltInPluginName =
  | 'stats'
  | 'xgLogger'
  | 'replay'
  | 'poster'
  | 'start'
  | 'enter'
  | 'miniscreen'
  | 'pc'
  | 'mobile'
  | 'keyboard'
  | 'loading'
  | 'progress'
  | 'MiniProgress'
  | 'progresspreview'
  | 'play'
  | 'fullscreen'
  | 'cssFullscreen'
  | 'time'
  | 'TimeSegmentsControls'
  | 'volume'
  | 'rotate'
  | 'pip'
  | 'playNext'
  | 'download'
  | 'screenShot'
  | 'definition'
  | 'playbackRate'
  | 'error'
  | 'prompt'
  | 'thumbnail'
  | 'dynamicBg'
  | 'gapJump'
  | 'waitingTimeoutJump'
  | 'testspeed'
  | 'FpsDetect';

export type XgplayerOptionalPluginName = 'danmu' | 'textTrack' | 'heatMap';
export type XgplayerPluginSwitch = boolean | Record<string, unknown>;

export interface XgplayerPluginConfig {
  builtin?: Partial<Record<XgplayerBuiltInPluginName, XgplayerPluginSwitch>>;
  optional?: Partial<Record<XgplayerOptionalPluginName, XgplayerPluginSwitch>>;
  extension?: XgplayerExtension;
  flv?: Record<string, unknown>;
  hls?: Record<string, unknown>;
  mp4?: Record<string, unknown>;
  custom?: unknown[];
}

export type XgplayerConfig = Omit<IPlayerOptions, 'el' | 'id' | 'url'>;
export type XgplayerEventHandler = (...args: unknown[]) => void;
export type XgplayerEvents = Record<string, XgplayerEventHandler>;

export interface MediaPlayerRef {
  getPlayer: () => XgplayerInstance | undefined;
  play: () => unknown;
  pause: () => void;
  replay: () => void;
  switchURL: (url: string) => Promise<unknown> | null;
}

interface MediaPlayerBaseProps {
  config?: XgplayerConfig;
  pluginConfig?: XgplayerPluginConfig;
  events?: XgplayerEvents;
  onReady?: (player: XgplayerInstance) => void;
  onError?: (error: Error) => void;
  loadingRender?: ReactNode;
  errorRender?: (error: Error) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface VideoPlayerProps extends MediaPlayerBaseProps {
  url: XgplayerSource;
  aspectRatio?: CSSProperties['aspectRatio'];
}

export interface MusicTrack {
  src: string;
  vid: string | number;
  poster?: string;
  title?: string;
}

export interface MusicPlayerProps extends MediaPlayerBaseProps {
  url?: string;
  playlist?: MusicTrack[];
  height?: CSSProperties['height'];
}

export interface MusicPlayerRef extends MediaPlayerRef {
  next: () => void;
  prev: () => void;
  setIndex: (index: number) => void;
  getMusicPlugin: () => unknown;
}

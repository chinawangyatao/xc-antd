import React from 'react';
import type { IPlayerOptions } from 'xgplayer';
import type {
  MusicTrack,
  XgplayerConfig,
  XgplayerEvents,
  XgplayerExtension,
  XgplayerInstance,
  XgplayerPluginConfig,
  XgplayerSource,
} from './types';
import {
  applyXgplayerBuiltInPlugins,
  isEnabledPlugin,
  resolveXgplayerMusicPresets,
  resolveXgplayerExtension,
} from './utils';

type PlayerKind = 'video' | 'music';
type LoadState = 'loading' | 'ready' | 'error';
const EMPTY_CONFIG: XgplayerConfig = {};
const EMPTY_PLUGIN_CONFIG: XgplayerPluginConfig = {};

interface UseXgplayerOptions {
  kind: PlayerKind;
  url?: XgplayerSource;
  playlist?: MusicTrack[];
  config?: XgplayerConfig;
  pluginConfig?: XgplayerPluginConfig;
  events?: XgplayerEvents;
  onReady?: (player: XgplayerInstance) => void;
  onError?: (error: Error) => void;
}

const OPTIONAL_PLUGIN_KEYS = {
  danmu: 'danmu',
  textTrack: 'texttrack',
  heatMap: 'heatmap',
} as const;

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

async function loadExtensionPlugin(extension: Exclude<XgplayerExtension, 'auto' | 'native'>) {
  if (extension === 'flv') return (await import('xgplayer-flv')).default;
  if (extension === 'hls') return (await import('xgplayer-hls')).default;
  return (await import('xgplayer-mp4')).default;
}

export function useXgplayer({
  kind,
  url,
  playlist,
  config = EMPTY_CONFIG,
  pluginConfig = EMPTY_PLUGIN_CONFIG,
  events,
  onReady,
  onError,
}: UseXgplayerOptions) {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<XgplayerInstance | undefined>(undefined);
  const onReadyRef = React.useRef(onReady);
  const onErrorRef = React.useRef(onError);
  const [state, setState] = React.useState<LoadState>('loading');
  const [error, setError] = React.useState<Error>();

  React.useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let disposed = false;
    let player: XgplayerInstance | undefined;

    const initialize = async () => {
      try {
        const source = url ?? playlist?.[0]?.src;
        if (!source) throw new Error('播放器缺少媒体地址');
        const extension = resolveXgplayerExtension(
          source,
          pluginConfig.extension ?? 'auto',
        );
        const [playerModule, extensionPlugin, musicModule] = await Promise.all([
          import('xgplayer'),
          extension === 'native' ? undefined : loadExtensionPlugin(extension),
          kind === 'music' ? import('xgplayer-music') : undefined,
        ]);
        if (disposed) return;

        const runtimePlugins: unknown[] = [
          ...(config.plugins ?? []),
          ...(pluginConfig.custom ?? []),
        ];
        const optionalPluginMap = {
          danmu: playerModule.Danmu,
          textTrack: playerModule.TextTrack,
          heatMap: playerModule.HeatMap,
        };
        Object.entries(pluginConfig.optional ?? {}).forEach(([name, setting]) => {
          if (!isEnabledPlugin(setting)) return;
          const optionalName = name as keyof typeof optionalPluginMap;
          runtimePlugins.push(optionalPluginMap[optionalName]);
        });
        if (extensionPlugin) runtimePlugins.push(extensionPlugin);

        let runtimeConfig: IPlayerOptions = applyXgplayerBuiltInPlugins({
          lang: 'zh-cn',
          width: '100%',
          height: '100%',
          ...config,
          el: mount,
          url: source,
          plugins: runtimePlugins,
        }, pluginConfig.builtin);

        Object.entries(pluginConfig.optional ?? {}).forEach(([name, setting]) => {
          if (typeof setting === 'object' && setting !== null) {
            const configKey = OPTIONAL_PLUGIN_KEYS[name as keyof typeof OPTIONAL_PLUGIN_KEYS];
            runtimeConfig[configKey] = setting;
          }
        });
        if (extension !== 'native') {
          runtimeConfig[extension] = {
            ...(typeof runtimeConfig[extension] === 'object'
              ? runtimeConfig[extension]
              : {}),
            ...(pluginConfig[extension] ?? {}),
          };
        }
        if (kind === 'music' && musicModule) {
          const currentMusicConfig = typeof runtimeConfig.music === 'object'
            ? runtimeConfig.music
            : {};
          runtimeConfig = {
            controls: { mode: 'flex', initShow: true },
            marginControls: true,
            ...runtimeConfig,
            mediaType: 'audio',
            presets: resolveXgplayerMusicPresets(
              runtimeConfig.presets,
              musicModule.default,
            ),
            music: {
              ...currentMusicConfig,
              ...(playlist?.length ? { list: playlist } : {}),
            },
          };
        }

        const Player = playerModule.default;
        player = new Player(runtimeConfig);
        playerRef.current = player;
        Object.entries(events ?? {}).forEach(([eventName, handler]) => {
          player?.on(eventName, handler);
        });
        setError(undefined);
        setState('ready');
        onReadyRef.current?.(player);
      } catch (caughtError) {
        if (disposed) return;
        const nextError = toError(caughtError);
        setError(nextError);
        setState('error');
        onErrorRef.current?.(nextError);
      }
    };

    void initialize();
    return () => {
      disposed = true;
      if (playerRef.current === player) playerRef.current = undefined;
      player?.destroy();
    };
  }, [config, events, kind, playlist, pluginConfig, url]);

  return { error, mountRef, playerRef, state };
}

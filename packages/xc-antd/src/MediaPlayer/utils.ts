import type { IPlayerOptions } from 'xgplayer';
import type {
  XgplayerBuiltInPluginName,
  XgplayerExtension,
  XgplayerPluginConfig,
  XgplayerPluginSwitch,
} from './types';

export const XGPLAYER_BUILTIN_PLUGIN_NAMES: XgplayerBuiltInPluginName[] = [
  'stats',
  'xgLogger',
  'replay',
  'poster',
  'start',
  'enter',
  'miniscreen',
  'pc',
  'mobile',
  'keyboard',
  'loading',
  'progress',
  'MiniProgress',
  'progresspreview',
  'play',
  'fullscreen',
  'cssFullscreen',
  'time',
  'TimeSegmentsControls',
  'volume',
  'rotate',
  'pip',
  'playNext',
  'download',
  'screenShot',
  'definition',
  'playbackRate',
  'error',
  'prompt',
  'thumbnail',
  'dynamicBg',
  'gapJump',
  'waitingTimeoutJump',
  'testspeed',
  'FpsDetect',
];

function getSourceUrls(source: IPlayerOptions['url']) {
  if (typeof source === 'string') return [source];
  if (Array.isArray(source)) {
    return source.flatMap((item) => typeof item === 'string'
      ? [item]
      : typeof item?.src === 'string'
        ? [item.src]
        : []);
  }
  return [];
}

export function resolveXgplayerExtension(
  source: IPlayerOptions['url'],
  extension: XgplayerExtension = 'auto',
) {
  if (extension !== 'auto') return extension;
  const paths = getSourceUrls(source)
    .map((url) => url.split(/[?#]/, 1)[0].toLocaleLowerCase());
  if (paths.some((path) => path.endsWith('.flv'))) return 'flv';
  if (paths.some((path) => path.endsWith('.m3u8'))) return 'hls';
  if (paths.some((path) => path.endsWith('.mp4') || path.endsWith('.m4a'))) {
    return 'mp4';
  }
  return 'native';
}

function findIgnoreIndex(ignores: string[], pluginName: string) {
  const normalizedName = pluginName.toLocaleLowerCase();
  return ignores.findIndex((item) => item.toLocaleLowerCase() === normalizedName);
}

export function applyXgplayerBuiltInPlugins(
  config: IPlayerOptions,
  builtin: XgplayerPluginConfig['builtin'],
) {
  const nextConfig = { ...config };
  const ignores = [...(config.ignores ?? [])];
  Object.entries(builtin ?? {}).forEach(([pluginName, setting]) => {
    if (setting === undefined) return;
    const ignoreIndex = findIgnoreIndex(ignores, pluginName);
    if (setting === false) {
      if (ignoreIndex === -1) ignores.push(pluginName);
      nextConfig[pluginName] = false;
      return;
    }
    if (ignoreIndex >= 0) ignores.splice(ignoreIndex, 1);
    nextConfig[pluginName] = setting === true ? true : setting;
  });
  nextConfig.ignores = ignores;
  return nextConfig;
}

export function isEnabledPlugin(setting: XgplayerPluginSwitch | undefined) {
  return setting === true || (typeof setting === 'object' && setting !== null);
}

export function resolveXgplayerMusicPresets(
  presets: unknown[] | undefined,
  musicPreset: unknown,
) {
  const currentPresets = presets ?? [];
  return [
    ...(currentPresets.includes('default')
      ? currentPresets
      : ['default', ...currentPresets]),
    musicPreset,
  ];
}

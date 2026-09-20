import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { MusicPlayer, VideoPlayer } from '../src/MediaPlayer';
import {
  applyXgplayerBuiltInPlugins,
  resolveXgplayerExtension,
  resolveXgplayerMusicPresets,
} from '../src/MediaPlayer/utils';

describe('MediaPlayer plugin resolution', () => {
  test('detects FLV, HLS, MP4 and M4A extensions', () => {
    expect(resolveXgplayerExtension('https://example.com/live.flv?token=1')).toBe('flv');
    expect(resolveXgplayerExtension('https://example.com/live.m3u8')).toBe('hls');
    expect(resolveXgplayerExtension('https://example.com/video.mp4')).toBe('mp4');
    expect(resolveXgplayerExtension('https://example.com/audio.m4a')).toBe('mp4');
    expect(resolveXgplayerExtension('https://example.com/audio.mp3')).toBe('native');
    expect(resolveXgplayerExtension('video.mp4', 'native')).toBe('native');
  });

  test('applies built-in switches without mutating source config', () => {
    const source = { ignores: ['pip'], playbackRate: [0.5, 1, 2] };
    const result = applyXgplayerBuiltInPlugins(source, {
      pip: true,
      download: false,
      screenShot: { quality: 0.9 },
    });
    expect(result.ignores).not.toContain('pip');
    expect(result.ignores).toContain('download');
    expect(result.pip).toBe(true);
    expect(result.screenShot).toEqual({ quality: 0.9 });
    expect(source).toEqual({ ignores: ['pip'], playbackRate: [0.5, 1, 2] });
  });

  test('keeps the default preset when adding the music preset', () => {
    const musicPreset = class MusicPreset {};
    expect(resolveXgplayerMusicPresets(undefined, musicPreset))
      .toEqual(['default', musicPreset]);
    expect(resolveXgplayerMusicPresets(['default', 'custom'], musicPreset))
      .toEqual(['default', 'custom', musicPreset]);
  });
});

describe('MediaPlayer rendering', () => {
  test('renders an SSR-safe video loading surface', () => {
    const html = renderToStaticMarkup(
      <VideoPlayer url="https://example.com/video.mp4" />,
    );
    expect(html).toContain('xc-video-player');
    expect(html).toContain('正在加载播放器');
  });

  test('renders an SSR-safe music loading surface', () => {
    const html = renderToStaticMarkup(
      <MusicPlayer url="https://example.com/audio.m4a" />,
    );
    expect(html).toContain('xc-music-player');
    expect(html).toContain('height:90px');
  });
});

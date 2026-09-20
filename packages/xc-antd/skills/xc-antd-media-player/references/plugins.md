# Plugin configuration

## Built-in preset

XGPlayer's default preset already registers the official built-in plugins.
Use `pluginConfig.builtin` to enable, disable, or configure them. `false` adds
the plugin to XGPlayer `ignores`; `true` enables it; an object enables it and is
passed under the plugin's own configuration key.

The typed names cover playback controls, progress/time/volume, fullscreen and
CSS fullscreen, PIP, mini screen, rotate, screenshot, download, definition,
playback rate, keyboard/mobile/PC behavior, loading/error/prompt/poster/start/
replay layers, previews, stats, gap recovery, speed tests, and FPS detection.

Music initialization must keep the string `default` in `presets` before
MusicPreset. XGPlayer stops auto-installing its default preset as soon as any
custom preset is supplied, and MusicPreset depends on default progress plugins.

Optional core plugins are configured separately:

```tsx
pluginConfig={{
  optional: {
    danmu: { comments: [] },
    textTrack: true,
    heatMap: false,
  },
}}
```

## Streaming extensions

- `flv`: dynamically imports `xgplayer-flv`; configure under `pluginConfig.flv`.
- `hls`: dynamically imports `xgplayer-hls`; configure under `pluginConfig.hls`.
- `mp4`: dynamically imports `xgplayer-mp4`; configure under `pluginConfig.mp4`.
- `native`: registers no streaming extension.

Only the selected extension is imported. `pluginConfig.custom` appends custom
XGPlayer plugin constructors or lazy-plugin descriptors to the native plugin
array.

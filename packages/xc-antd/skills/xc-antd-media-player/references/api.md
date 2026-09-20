# VideoPlayer and MusicPlayer API

## Video

```tsx
<VideoPlayer
  url={url}
  config={{ autoplay: false, playbackRate: [0.5, 1, 1.5, 2] }}
  pluginConfig={{
    extension: 'hls',
    builtin: { pip: true, download: false },
    hls: { retryCount: 3 },
  }}
/>
```

`extension="auto"` detects `.flv`, `.m3u8`, `.mp4`, and `.m4a`; use
`native` to force browser-native playback. `config` passes XGPlayer options
through except the React-owned mount element and source URL.

## Music and M4A

```tsx
<MusicPlayer
  playlist={[{ src: m4aUrl, vid: 'track-1', title: 'Track' }]}
  config={{ music: { mode: 'loop' } }}
  pluginConfig={{ extension: 'mp4', mp4: { retryCount: 2 } }}
/>
```

`MusicPlayer` installs the official MusicPreset and forces `mediaType="audio"`.
For M4A, use the MP4 extension or `auto`; the origin must support CORS and byte
range requests.

## Lifecycle

- `events` binds arbitrary XGPlayer event names.
- `onReady` receives the player instance; `onError` reports import or creation
  failures.
- `MediaPlayerRef` exposes get/play/pause/replay/switchURL.
- `MusicPlayerRef` additionally exposes next/prev/setIndex/getMusicPlugin.
- Memoize object props when a parent rerenders frequently because plugin or
  config changes recreate the imperative player instance.

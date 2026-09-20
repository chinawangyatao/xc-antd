---
name: xc-antd-media-player
description: Build, integrate, or troubleshoot xc-antd VideoPlayer and MusicPlayer. Use for XGPlayer configuration, built-in plugin switches, FLV/HLS/MP4 extensions, music playlists, M4A playback, media events, or player refs. Do not use for plain native video/audio elements.
---

# xc-antd Media Players

Use `VideoPlayer` and `MusicPlayer` as the React lifecycle boundary around
XGPlayer. Read [references/api.md](references/api.md) for component usage and
[references/plugins.md](references/plugins.md) when configuring plugins or
stream formats.

## Source of truth

Inside this repository, inspect:

- `packages/xc-antd/src/MediaPlayer/types.ts`
- `packages/xc-antd/src/MediaPlayer/useXgplayer.ts`
- `packages/xc-antd/src/MediaPlayer/utils.ts`
- `apps/docs/src/pages/MediaPlayerDemo.tsx`

In a consuming project, inspect the installed
`node_modules/xc-antd/src/MediaPlayer/` source and types; installed source wins
over these references.

## Working rules

- Keep `xgplayer`, all extensions, and `core-js` on compatible versions.
- Treat `config` as XGPlayer passthrough and `pluginConfig` as the declarative
  plugin-selection boundary.
- Load only one streaming extension for one player instance.
- Destroy the player on React cleanup; do not instantiate it during SSR.
- M4A playback uses the MP4 extension and requires byte-range/CORS support from
  the media server.

## Verification

Run MediaPlayer tests, typecheck, ESLint, library build, docs build, and the
`/media-player` example after changes.

import React from 'react';
import {
  Card,
  Segmented,
  Space,
  Typography,
  message,
} from 'antd';
import {
  MusicPlayer,
  VideoPlayer,
  type MusicTrack,
  type XgplayerExtension,
} from 'xc-antd';

type VideoSourceKey = 'mp4' | 'hls' | 'flv';

const videoSources: Record<VideoSourceKey, {
  url: string;
  extension: XgplayerExtension;
}> = {
  mp4: {
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    extension: 'mp4',
  },
  hls: {
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    extension: 'hls',
  },
  flv: {
    url: 'https://sf1-hscdn-tos.pstatp.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-720p.flv',
    extension: 'flv',
  },
};

export default function MediaPlayerDemo() {
  const [messageApi, contextHolder] = message.useMessage();
  const [sourceKey, setSourceKey] = React.useState<VideoSourceKey>('mp4');
  const source = videoSources[sourceKey];
  const m4aPlaylist = React.useMemo<MusicTrack[]>(() => [{
    src: `${import.meta.env.BASE_URL}media/xc-demo.m4a`,
    vid: 'm4a-demo',
    title: 'M4A 音频示例',
  }], []);
  const videoConfig = React.useMemo(() => ({
    autoplay: false,
    poster: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm.jpg',
    playbackRate: [0.5, 1, 1.5, 2],
  }), []);
  const videoPluginConfig = React.useMemo(() => ({
    extension: source.extension,
    builtin: {
      pip: true,
      download: true,
      screenShot: false,
      playbackRate: true,
    },
  }), [source.extension]);
  const musicConfig = React.useMemo(() => ({
    autoplay: false,
    volume: 0.7,
    music: { mode: 'loop' },
  }), []);
  const musicPluginConfig = React.useMemo(() => ({
    extension: 'mp4' as const,
    mp4: {
      retryCount: 2,
      enableWorker: false,
    },
  }), []);

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      {contextHolder}
      <div>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          VideoPlayer / MusicPlayer
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          XGPlayer 视频流扩展、内置插件开关和 M4A 音乐播放。
        </Typography.Paragraph>
      </div>

      <Card
        title="视频播放器"
        extra={(
          <Segmented<VideoSourceKey>
            value={sourceKey}
            options={[
              { label: 'MP4', value: 'mp4' },
              { label: 'HLS', value: 'hls' },
              { label: 'FLV', value: 'flv' },
            ]}
            onChange={setSourceKey}
          />
        )}
      >
        <VideoPlayer
          url={source.url}
          config={videoConfig}
          pluginConfig={videoPluginConfig}
          onError={(error) => void messageApi.error(error.message)}
        />
      </Card>

      <Card title="M4A 音乐播放器">
        <MusicPlayer
          playlist={m4aPlaylist}
          config={musicConfig}
          pluginConfig={musicPluginConfig}
          onError={(error) => void messageApi.error(error.message)}
        />
      </Card>
    </Space>
  );
}

import React from 'react';
import {
  Alert,
  Card,
  Descriptions,
  message,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import {
  AmapEditor,
  type AmapLngLat,
  type AmapMarkersChangeInfo,
  type AmapPathChangeInfo,
} from 'xc-antd';

const initialMarkers: AmapLngLat[] = [
  [120.312786, 36.064812],
  [120.32461, 36.07051],
];

const initialPath: AmapLngLat[] = [
  [120.3008, 36.0581],
  [120.3112, 36.0702],
  [120.3267, 36.0646],
];

export default function AmapEditorDemo() {
  const apiKey = import.meta.env.VITE_AMAP_KEY ?? '';
  const securityJsCode = import.meta.env.VITE_AMAP_SECURITY_CODE;
  const [messageApi, contextHolder] = message.useMessage();
  const [markers, setMarkers] = React.useState(initialMarkers);
  const [path, setPath] = React.useState(initialPath);
  const [dashed, setDashed] = React.useState(false);
  const [lastAction, setLastAction] = React.useState('等待地图操作');
  const [currentLocation, setCurrentLocation] = React.useState<AmapLngLat>();

  const handleMarkersChange = (
    nextMarkers: AmapLngLat[],
    info: AmapMarkersChangeInfo,
  ) => {
    setMarkers(nextMarkers);
    setLastAction(`标点：${info.action}`);
  };

  const handlePathChange = (
    nextPath: AmapLngLat[],
    info: AmapPathChangeInfo,
  ) => {
    setPath(nextPath);
    setLastAction(`路径：${info.action}${info.closed ? '（已闭合）' : ''}`);
  };

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      {contextHolder}
      <div>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          AmapEditor 高德地图编辑器
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          地图打点、折线绘制、路径闭合、搜索和视野控制。
        </Typography.Paragraph>
      </div>

      {!apiKey && (
        <Alert
          showIcon
          type="warning"
          title="示例尚未配置高德地图凭证"
          description="在 apps/docs/.env.local 中设置 VITE_AMAP_KEY 和 VITE_AMAP_SECURITY_CODE 后即可加载地图。"
        />
      )}

      <Card
        title="地图编辑"
        extra={(
          <Space>
            <Typography.Text type="secondary">虚线路径</Typography.Text>
            <Switch size="small" checked={dashed} onChange={setDashed} />
          </Space>
        )}
      >
        <AmapEditor
          apiKey={apiKey}
          securityJsCode={securityJsCode}
          defaultCenter={[120.312786, 36.064812]}
          defaultZoom={13}
          height={520}
          markers={markers}
          onMarkersChange={handleMarkersChange}
          path={path}
          onPathChange={handlePathChange}
          clearPreviousMarkers={false}
          closeThreshold={24}
          controls={{
            scale: true,
            toolBar: true,
            mapType: true,
          }}
          search={{
            city: '青岛',
            cityLimit: true,
            autoMove: true,
            autoMark: true,
          }}
          polylineProps={{ strokeStyle: dashed ? 'dashed' : 'solid' }}
          onSearchSelect={(result) => setLastAction(`搜索：${result.name}`)}
          onSearchError={(error) => void messageApi.error(error.message)}
          onLocationError={() => void messageApi.error('定位失败，请检查浏览器权限')}
          onLocationChange={(position) => {
            setCurrentLocation(position);
            setLastAction('已定位当前位置');
          }}
        />

        <Descriptions
          size="small"
          column={{ xs: 1, sm: 2, xl: 4 }}
          style={{ marginTop: 16 }}
          items={[
            {
              key: 'markers',
              label: '标点数量',
              children: <Tag color="blue">{markers.length}</Tag>,
            },
            {
              key: 'path',
              label: '路径节点',
              children: <Tag color="green">{path.length}</Tag>,
            },
            {
              key: 'location',
              label: '当前位置',
              children: currentLocation
                ? `${currentLocation[0].toFixed(5)}, ${currentLocation[1].toFixed(5)}`
                : '尚未定位',
            },
            {
              key: 'action',
              label: '最近操作',
              children: lastAction,
            },
          ]}
        />
      </Card>
    </Space>
  );
}

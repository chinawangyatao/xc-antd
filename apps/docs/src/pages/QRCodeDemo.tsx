import React from 'react';
import {
  Card,
  Col,
  Input,
  Row,
  Segmented,
  Space,
  Typography,
} from 'antd';
import { QRCode, type QRCodeStatus } from 'xc-antd';

const initialValue = 'https://chinawangyatao.github.io/xc-antd/';

export default function QRCodeDemo() {
  const [value, setValue] = React.useState(initialValue);
  const [status, setStatus] = React.useState<QRCodeStatus>('active');

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          QRCode 二维码
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          SVG、Canvas 二维码与业务状态展示。
        </Typography.Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="实时内容" style={{ height: '100%' }}>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <Input
                value={value}
                allowClear
                placeholder="请输入二维码内容"
                onChange={(event) => setValue(event.target.value)}
              />
              <div style={{ textAlign: 'center' }}>
                <QRCode value={value} title="示例链接二维码" />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Canvas 与配色" style={{ height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <QRCode
                value="XC-ANTD-CANVAS-DEMO"
                renderType="canvas"
                level="Q"
                fgColor="#0958d9"
                bgColor="#f0f5ff"
                marginSize={3}
                title="Canvas 二维码"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="业务状态" style={{ height: '100%' }}>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <Segmented<QRCodeStatus>
                block
                value={status}
                options={[
                  { label: '正常', value: 'active' },
                  { label: '加载', value: 'loading' },
                  { label: '过期', value: 'expired' },
                  { label: '已扫描', value: 'scanned' },
                ]}
                onChange={setStatus}
              />
              <div style={{ textAlign: 'center' }}>
                <QRCode
                  value="XC-ANTD-STATUS-DEMO"
                  status={status}
                  onRefresh={() => setStatus('active')}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

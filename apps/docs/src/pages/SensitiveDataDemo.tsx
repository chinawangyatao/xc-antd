import React from 'react';
import {
  Alert,
  Card,
  Col,
  Descriptions,
  message,
  Row,
  Space,
  Typography,
} from 'antd';
import { SensitiveData } from 'xc-antd';

function wait(duration: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, duration);
    signal.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('请求已取消', 'AbortError'));
    }, { once: true });
  });
}

const localItems = [
  { key: 'phone', label: '手机号', children: <SensitiveData type="phone" value="15624181187" /> },
  { key: 'email', label: '邮箱', children: <SensitiveData type="email" value="1176317790@qq.com" /> },
  { key: 'name', label: '姓名', children: <SensitiveData type="name" value="王煦澄" /> },
  { key: 'idCard', label: '身份证', children: <SensitiveData type="idCard" value="37021219900101123X" /> },
  { key: 'bankCard', label: '银行卡', children: <SensitiveData type="bankCard" value="6222021234567890123" /> },
  { key: 'key', label: 'API Key', children: <SensitiveData type="key" value="sk_live_1234567890" /> },
  { key: 'address', label: '地址', children: <SensitiveData type="address" value="山东省青岛市崂山区中韩街道智慧大厦" /> },
];

export default function SensitiveDataDemo() {
  const [messageApi, contextHolder] = message.useMessage();

  const showError = (error: Error) => {
    void messageApi.error(error.message);
  };

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      {contextHolder}
      <div>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          SensitiveData 敏感数据脱敏
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          支持本地脱敏展示，也可在用户查看时向服务端请求原文或原图。
        </Typography.Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="常用脱敏类型" style={{ height: '100%' }}>
            <Descriptions bordered column={1} size="small" items={localItems} />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="按需请求原文" style={{ height: '100%' }}>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <Alert
                type="info"
                showIcon
                message="请求模式下，页面初始不包含原文"
              />
              <div>
                <Typography.Text type="secondary">联系地址</Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <SensitiveData
                    type="address"
                    value="山东省青岛市************"
                    revealMode="request"
                    request={async (_, { signal }) => {
                      await wait(600, signal);
                      return '山东省青岛市崂山区中韩街道智慧大厦 8 号';
                    }}
                    onRequestError={showError}
                  />
                </div>
              </div>
              <div>
                <Typography.Text type="secondary">证件照片</Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <SensitiveData
                    type="image"
                    value=""
                    revealMode="request"
                    width={160}
                    height={160}
                    request={async (_, { signal }) => {
                      await wait(600, signal);
                      return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&q=80';
                    }}
                    onRequestError={showError}
                  />
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

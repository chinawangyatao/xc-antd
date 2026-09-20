import React from 'react';
import {
  Button,
  Card,
  Col,
  message,
  Row,
  Space,
  Typography,
} from 'antd';
import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { RichTextEditor } from 'xc-antd';

const initialContent = `
  <h2>秋季产品运营计划</h2>
  <p>本期内容围绕<strong>城市周末游</strong>展开，重点覆盖亲子、文化和轻户外主题。</p>
  <ul>
    <li>完成专题页内容校对</li>
    <li>补充核心产品的预订说明</li>
    <li>统一活动图片和链接</li>
  </ul>
  <blockquote>正式发布前请完成移动端预览。</blockquote>
`;

export default function RichTextEditorDemo() {
  const [messageApi, contextHolder] = message.useMessage();
  const [content, setContent] = React.useState(initialContent);

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      {contextHolder}
      <div>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          RichTextEditor 富文本编辑器
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          面向公告、产品说明和运营内容编辑，输出 HTML 字符串。
        </Typography.Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card title="内容编辑" style={{ height: '100%' }}>
            <RichTextEditor
              value={content}
              minHeight={280}
              placeholder="请输入正文内容"
              onChange={setContent}
            />
            <Space wrap style={{ marginTop: 16 }}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => void messageApi.success('内容已保存')}
              >
                保存内容
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => setContent(initialContent)}
              >
                重置
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card title="只读预览" style={{ height: '100%' }}>
            <RichTextEditor value={content} minHeight={280} readOnly />
          </Card>
        </Col>
      </Row>

      <Card title="禁用状态">
        <RichTextEditor
          value="<p>审核中的内容暂时不能修改。</p>"
          minHeight={96}
          disabled
        />
      </Card>
    </Space>
  );
}

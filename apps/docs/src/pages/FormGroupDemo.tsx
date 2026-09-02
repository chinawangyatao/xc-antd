import { Button, Col, Form, Input, Select, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { FormGroup } from '@xc-antd/ui';

const FormGroupDemo = () => (
  <div>
    <Typography.Title level={3} style={{ marginTop: 0 }}>
      FormGroup
    </Typography.Title>
    <Typography.Paragraph type="secondary">
      用带标识标题和栅格内容区的 section 组织较长表单。
    </Typography.Paragraph>

    <Form layout="vertical">
      <FormGroup
        title="基础信息"
        extra={<Button type="link" icon={<EditOutlined />}>编辑说明</Button>}
      >
        <Col xs={24} md={12}>
          <Form.Item label="名称" name="name">
            <Input placeholder="请输入名称" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="分类" name="category">
            <Select
              placeholder="请选择分类"
              options={[
                { label: '标准', value: 'standard' },
                { label: '高级', value: 'advanced' },
              ]}
            />
          </Form.Item>
        </Col>
      </FormGroup>

      <FormGroup title="联系信息">
        <Col xs={24} md={12}>
          <Form.Item label="联系人" name="contact">
            <Input placeholder="请输入联系人" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>
        </Col>
      </FormGroup>
    </Form>
  </div>
);

export default FormGroupDemo;

import { Card, Typography, Space, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

function Home() {
  const navigate = useNavigate()

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Title level={3} style={{ margin: 0 }}>
          xc-antd 组件库
        </Title>
        <Paragraph style={{ color: '#666', marginTop: 8 }}>
          基于 Ant Design 5.x 的 TextField 原子字段组件库。
        </Paragraph>
      </Card>

      <Title level={4}>组件列表</Title>
      <Card hoverable onClick={() => navigate('/pro-field')} style={{ cursor: 'pointer' }}>
        <Title level={5} style={{ margin: 0 }}>
          TextField
        </Title>
        <Paragraph style={{ color: '#666', marginTop: 8, marginBottom: 8 }}>
          通过 valueType 切换不同类型字段（文本/金额/日期/选择/进度/评分 ...）的展示和编辑形态。
        </Paragraph>
        <Space>
          <Tag color="blue">原子字段</Tag>
          <Tag>支持 read / edit 两种 mode</Tag>
        </Space>
      </Card>

      <Card hoverable onClick={() => navigate('/crud-table')} style={{ cursor: 'pointer' }}>
        <Title level={5} style={{ margin: 0 }}>
          CrudTable
        </Title>
        <Paragraph style={{ color: '#666', marginTop: 8, marginBottom: 8 }}>
          面向真实列表页的查询、请求、分页、选择、自定义列和操作扩展组件。
        </Paragraph>
        <Space>
          <Tag color="green">业务表格</Tag>
          <Tag>配置驱动</Tag>
          <Tag>服务端请求</Tag>
        </Space>
      </Card>

      <Card hoverable onClick={() => navigate('/action-overlay')} style={{ cursor: 'pointer' }}>
        <Title level={5} style={{ margin: 0 }}>
          ActionDrawer / ActionModal
        </Title>
        <Paragraph style={{ color: '#666', marginTop: 8, marginBottom: 8 }}>
          统一确认与取消顺序、底部左对齐和异步提交状态的操作容器。
        </Paragraph>
        <Space>
          <Tag color="blue">抽屉优先</Tag>
          <Tag>统一 Footer</Tag>
        </Space>
      </Card>

      <Card hoverable onClick={() => navigate('/form-group')} style={{ cursor: 'pointer' }}>
        <Title level={5} style={{ margin: 0 }}>
          FormGroup
        </Title>
        <Paragraph style={{ color: '#666', marginTop: 8, marginBottom: 8 }}>
          使用标识标题和栅格内容区组织较长表单。
        </Paragraph>
        <Space>
          <Tag color="cyan">表单分组</Tag>
          <Tag>React Children</Tag>
        </Space>
      </Card>

      <Card hoverable onClick={() => navigate('/schema-form')} style={{ cursor: 'pointer' }}>
        <Title level={5} style={{ margin: 0 }}>
          SchemaForm
        </Title>
        <Paragraph style={{ color: '#666', marginTop: 8, marginBottom: 8 }}>
          由配置驱动分组、字段、校验、联动和提交转换的重型表单。
        </Paragraph>
        <Space>
          <Tag color="purple">配置表单</Tag>
          <Tag>类型安全</Tag>
          <Tag>字段联动</Tag>
        </Space>
      </Card>

      <Card>
        <Title level={4}>快速开始</Title>
        <pre
          style={{
            background: '#f6f8fa',
            padding: 16,
            borderRadius: 6,
            fontSize: 13,
            overflow: 'auto',
          }}
        >
{`// 1. 安装依赖
npm install @xc-antd/ui antd dayjs swr

// 2. 引入并使用
import { TextField } from '@xc-antd/ui'

// 只读
<TextField valueType="money" text={9999.99} />

// 编辑
<TextField mode="edit" valueType="date" text="2026-06-02" />

// 自定义枚举
<TextField
  valueType="select"
  text="online"
  valueEnum={{
    online: { text: '在线', status: 'Success' },
    offline: { text: '离线', status: 'Default' },
  }}
/>`}
        </pre>
      </Card>
    </Space>
  )
}

export default Home

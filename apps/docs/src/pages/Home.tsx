import { Card, Typography, Space, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

function Home() {
  const navigate = useNavigate()

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
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

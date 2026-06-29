import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons'
import Home from './pages/Home'
import ProFieldDemo from './pages/ProFieldDemo'
import { useLocation, useNavigate } from 'react-router-dom'
import Table from "./pages/Table.tsx";

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/pro-field', icon: <AppstoreOutlined />, label: 'TextField 示例' },
  { key: '/table', icon: <AppstoreOutlined />, label: 'Table 示例' },
]

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  // 根据当前路径展开对应菜单
  const selectedKeys = [location.pathname]
  const openKeys = location.pathname !== '/' ? ['components'] : []

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
        }}
      >
        <h1 style={{ fontSize: 18, margin: 0, color: '#1677ff' }}>
          xc-antd 组件库
        </h1>
        <span
          style={{
            marginLeft: 12,
            fontSize: 13,
            color: '#999',
          }}
        >
          基于 Ant Design 的二次封装组件库
        </span>
      </Header>
      <Layout>
        <Sider
          width={220}
          style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
        >
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ borderRight: 0, marginTop: 8 }}
          />
        </Sider>
        <Content
          style={{
            padding: 24,
            background: '#f5f5f5',
            overflow: 'auto',
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pro-field" element={<ProFieldDemo />} />
            <Route path="/table" element={<Table />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App

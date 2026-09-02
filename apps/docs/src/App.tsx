import { Routes, Route, Navigate } from 'react-router-dom'
import { Button, Drawer, Grid, Layout, Menu } from 'antd'
import { HomeOutlined, AppstoreOutlined, ExportOutlined, FormOutlined, MenuOutlined, ProfileOutlined, TableOutlined } from '@ant-design/icons'
import Home from './pages/Home'
import ProFieldDemo from './pages/ProFieldDemo'
import { useLocation, useNavigate } from 'react-router-dom'
import Table from "./pages/Table.tsx";
import CrudTableDemo from './pages/CrudTableDemo'
import { useState } from 'react'
import ActionOverlayDemo from './pages/ActionOverlayDemo'
import FormGroupDemo from './pages/FormGroupDemo'
import SchemaFormDemo from './pages/SchemaFormDemo'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/pro-field', icon: <AppstoreOutlined />, label: 'TextField 示例' },
  { key: '/table', icon: <AppstoreOutlined />, label: 'Table 示例' },
  { key: '/crud-table', icon: <TableOutlined />, label: 'CrudTable 示例' },
  { key: '/action-overlay', icon: <ExportOutlined />, label: '抽屉与弹窗' },
  { key: '/form-group', icon: <FormOutlined />, label: 'FormGroup 示例' },
  { key: '/schema-form', icon: <ProfileOutlined />, label: 'SchemaForm 示例' },
]

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const [menuOpen, setMenuOpen] = useState(false)

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
    setMenuOpen(false)
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
          padding: isMobile ? '0 12px' : '0 24px',
        }}
      >
        {isMobile && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            aria-label="打开导航"
            onClick={() => setMenuOpen(true)}
            style={{ marginRight: 8 }}
          />
        )}
        <h1 style={{ fontSize: 18, margin: 0, color: '#1677ff' }}>
          xc-antd 组件库
        </h1>
        {!isMobile && <span
          style={{
            marginLeft: 12,
            fontSize: 13,
            color: '#999',
          }}
        >
          基于 Ant Design 的二次封装组件库
        </span>}
      </Header>
      <Layout>
        {!isMobile && <Sider
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
        </Sider>}
        <Drawer
          title="组件导航"
          placement="left"
          open={isMobile && menuOpen}
          onClose={() => setMenuOpen(false)}
          size={280}
          styles={{ body: { padding: 0 } }}
        >
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Drawer>
        <Content
          style={{
            padding: isMobile ? 12 : 24,
            background: '#f5f5f5',
            overflow: 'auto',
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pro-field" element={<ProFieldDemo />} />
            <Route path="/table" element={<Table />} />
            <Route path="/crud-table" element={<CrudTableDemo />} />
            <Route path="/action-overlay" element={<ActionOverlayDemo />} />
            <Route path="/form-group" element={<FormGroupDemo />} />
            <Route path="/schema-form" element={<SchemaFormDemo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App

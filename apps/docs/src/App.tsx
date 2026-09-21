import { Routes, Route, Navigate } from 'react-router-dom'
import { Button, Drawer, Grid, Layout, Menu, type MenuProps } from 'antd'
import { HomeOutlined, AppstoreOutlined, EnvironmentOutlined, ExportOutlined, FormOutlined, MenuOutlined, PictureOutlined, PlaySquareOutlined, ProfileOutlined, QrcodeOutlined, SafetyCertificateOutlined, TableOutlined } from '@ant-design/icons'
import Home from './pages/Home'
import ProFieldDemo from './pages/ProFieldDemo'
import { useLocation, useNavigate } from 'react-router-dom'
import Table from "./pages/Table.tsx";
import CrudTableDemo from './pages/CrudTableDemo'
import { useState } from 'react'
import ActionOverlayDemo from './pages/ActionOverlayDemo'
import FormGroupDemo from './pages/FormGroupDemo'
import SchemaFormDemo from './pages/SchemaFormDemo'
import TreeSelectPage from "./pages/TreeSelectPage.tsx";
import ImageUploadDemo from './pages/ImageUploadDemo'
import GroupedSelectDemo from './pages/GroupedSelectDemo'
import SensitiveDataDemo from './pages/SensitiveDataDemo'
import RichTextEditorDemo from './pages/RichTextEditorDemo'
import AmapEditorDemo from './pages/AmapEditorDemo'
import QRCodeDemo from './pages/QRCodeDemo'
import MediaPlayerDemo from './pages/MediaPlayerDemo'
import PermissionDemo from './pages/PermissionDemo'

const { Header, Sider, Content } = Layout

const menuItems: MenuProps['items'] = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  {
    key: 'display',
    icon: <SafetyCertificateOutlined />,
    label: '展示类',
    children: [
      { key: '/pro-field', icon: <AppstoreOutlined />, label: 'TextField' },
      { key: '/sensitive-data', icon: <SafetyCertificateOutlined />, label: 'SensitiveData' },
      { key: '/qr-code', icon: <QrcodeOutlined />, label: 'QRCode' },
    ],
  },
  {
    key: 'data',
    icon: <TableOutlined />,
    label: '数据类',
    children: [
      { key: '/table', icon: <AppstoreOutlined />, label: 'HocTable' },
      { key: '/crud-table', icon: <TableOutlined />, label: 'CrudTable' },
      { key: '/tree-select', icon: <AppstoreOutlined />, label: 'List / ListTree' },
    ],
  },
  {
    key: 'interaction',
    icon: <AppstoreOutlined />,
    label: '交互类',
    children: [
      { key: '/action-overlay', icon: <ExportOutlined />, label: '抽屉与弹窗' },
      { key: '/grouped-select', icon: <AppstoreOutlined />, label: 'GroupedSelect' },
      { key: '/image-upload', icon: <PictureOutlined />, label: 'ImageUpload' },
      { key: '/rich-text-editor', icon: <FormOutlined />, label: 'RichTextEditor' },
      { key: '/amap-editor', icon: <EnvironmentOutlined />, label: 'AmapEditor' },
      { key: '/media-player', icon: <PlaySquareOutlined />, label: 'Video / Music' },
      { key: '/permission', icon: <SafetyCertificateOutlined />, label: 'Permission' },
    ],
  },
  {
    key: 'layout',
    icon: <ProfileOutlined />,
    label: '布局类',
    children: [
      { key: '/form-group', icon: <FormOutlined />, label: 'FormGroup' },
      { key: '/schema-form', icon: <ProfileOutlined />, label: 'SchemaForm' },
    ],
  },
]

const menuCategoryByPath: Record<string, string> = {
  '/pro-field': 'display',
  '/sensitive-data': 'display',
  '/qr-code': 'display',
  '/table': 'data',
  '/crud-table': 'data',
  '/tree-select': 'data',
  '/action-overlay': 'interaction',
  '/grouped-select': 'interaction',
  '/image-upload': 'interaction',
  '/rich-text-editor': 'interaction',
  '/amap-editor': 'interaction',
  '/media-player': 'interaction',
  '/permission': 'interaction',
  '/form-group': 'layout',
  '/schema-form': 'layout',
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const [menuOpen, setMenuOpen] = useState(false)
  const activeCategory = menuCategoryByPath[location.pathname]
  const [openKeys, setOpenKeys] = useState<string[]>()
  const resolvedOpenKeys = openKeys ?? (activeCategory ? [activeCategory] : [])

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
    setMenuOpen(false)
  }

  const selectedKeys = [location.pathname]

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
            openKeys={resolvedOpenKeys}
            onOpenChange={(keys) => setOpenKeys(keys.map(String))}
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
            openKeys={resolvedOpenKeys}
            onOpenChange={(keys) => setOpenKeys(keys.map(String))}
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
            <Route path="/tree-select" element={<TreeSelectPage />} />
            <Route path="/grouped-select" element={<GroupedSelectDemo />} />
            <Route path="/image-upload" element={<ImageUploadDemo />} />
            <Route path="/sensitive-data" element={<SensitiveDataDemo />} />
            <Route path="/rich-text-editor" element={<RichTextEditorDemo />} />
            <Route path="/amap-editor" element={<AmapEditorDemo />} />
            <Route path="/qr-code" element={<QRCodeDemo />} />
            <Route path="/media-player" element={<MediaPlayerDemo />} />
            <Route path="/permission" element={<PermissionDemo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App

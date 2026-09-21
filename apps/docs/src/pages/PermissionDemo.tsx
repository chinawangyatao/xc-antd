import React from 'react';
import {
  Alert,
  Button,
  Card,
  Collapse,
  Descriptions,
  Segmented,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  PermissionGuard,
  PermissionProvider,
  defaultPermissionMatcher,
  usePermission,
  type PermissionMatcher,
} from 'xc-antd';

type DemoRole = 'visitor' | 'editor' | 'administrator';

interface Article {
  id: number;
  title: string;
  ownerId: string;
  ownerName: string;
}

const currentUserId = 'user-1001';
const rolePermissions: Record<DemoRole, readonly string[]> = {
  visitor: ['article:view'],
  editor: ['article:view', 'article:create', 'article:update:own'],
  administrator: ['*'],
};

const articles: Article[] = [
  { id: 1, title: '青岛旅游攻略', ownerId: currentUserId, ownerName: '当前用户' },
  { id: 2, title: '平台运营规范', ownerId: 'user-2002', ownerName: '李明' },
];

const providerCode = `<PermissionProvider permissions={permissionCodes}>
  <App />
</PermissionProvider>`;

const guardCode = `<PermissionGuard
  permission="article:create"
  fallback={<Button disabled>新建文章</Button>}
>
  <Button type="primary">新建文章</Button>
</PermissionGuard>`;

const hookCode = `const { can, loading, permissions } = usePermission();

const visibleMenus = menus.filter((item) =>
  !item.permission || can(item.permission, { mode: item.mode }),
);`;

const resourceCode = `<PermissionGuard
  permission="article:update"
  resource={article}
>
  <Button>编辑</Button>
</PermissionGuard>`;

function CodeBlock({ children }: { children: string }) {
  return (
    <div
      style={{
        overflowX: 'auto',
        padding: 12,
        border: '1px solid #f0f0f0',
        borderRadius: 6,
        background: '#fafafa',
      }}
    >
      <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function HookExample({ onCreate }: { onCreate: () => void }) {
  const { can, loading, permissions } = usePermission();
  const canCreate = can('article:create');
  const canManage = can(['article:create', 'article:delete'], { mode: 'any' });

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Descriptions
        size="small"
        column={{ xs: 1, sm: 3 }}
        items={[
          {
            key: 'loading',
            label: '加载状态',
            children: <Tag color={loading ? 'processing' : 'success'}>{String(loading)}</Tag>,
          },
          {
            key: 'create',
            label: '可新建',
            children: <Tag color={canCreate ? 'success' : 'default'}>{String(canCreate)}</Tag>,
          },
          {
            key: 'manage',
            label: '任意管理权限',
            children: <Tag color={canManage ? 'success' : 'default'}>{String(canManage)}</Tag>,
          },
        ]}
      />
      <Space wrap>
        <Button type="primary" disabled={!canCreate} onClick={onCreate}>
          Hook 新建
        </Button>
        {permissions.map((permission) => <Tag key={permission}>{permission}</Tag>)}
      </Space>
    </Space>
  );
}

export default function PermissionDemo() {
  const [messageApi, contextHolder] = message.useMessage();
  const [role, setRole] = React.useState<DemoRole>('editor');
  const permissions = rolePermissions[role];

  const matcher = React.useCallback<PermissionMatcher>((params) => {
    if (params.granted.includes('*')) return true;
    if (defaultPermissionMatcher(params)) return true;

    const resource = params.resource as Article | undefined;
    return params.required.includes('article:update')
      && params.granted.includes('article:update:own')
      && resource?.ownerId === currentUserId;
  }, []);

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      {contextHolder}
      <div>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Permission 权限控制
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          根节点注入权限码，统一控制组件渲染、菜单过滤和资源级业务规则。
        </Typography.Paragraph>
      </div>

      <Card title="模拟权限身份">
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
          <Segmented<DemoRole>
            value={role}
            options={[
              { label: '访客', value: 'visitor' },
              { label: '编辑', value: 'editor' },
              { label: '管理员', value: 'administrator' },
            ]}
            onChange={setRole}
          />
          <Space wrap>
            <Typography.Text type="secondary">已注入：</Typography.Text>
            {permissions.map((permission) => (
              <Tag color="blue" key={permission}>{permission}</Tag>
            ))}
          </Space>
        </Space>
      </Card>

      <PermissionProvider permissions={permissions} matcher={matcher}>
        <Card title="PermissionGuard 组件包裹">
          <Space wrap size="middle">
            <PermissionGuard
              permission="article:create"
              fallback={<Button disabled>新建文章</Button>}
            >
              <Button
                type="primary"
                onClick={() => void messageApi.success('已执行新建操作')}
              >
                新建文章
              </Button>
            </PermissionGuard>
            <PermissionGuard
              permission={['article:create', 'article:delete']}
              mode="any"
              fallback={<Tag>无内容管理权限</Tag>}
            >
              <Tag color="green">any：可进入内容管理</Tag>
            </PermissionGuard>
            <PermissionGuard
              permission={['article:create', 'article:delete']}
              mode="all"
              fallback={<Tag>all：权限不完整</Tag>}
            >
              <Tag color="gold">all：拥有全部管理权限</Tag>
            </PermissionGuard>
          </Space>
        </Card>

        <Card title="usePermission 业务判断">
          <HookExample
            onCreate={() => void messageApi.success('usePermission 判断通过')}
          />
        </Card>

        <Card title="自定义 matcher 与资源权限">
          <div>
            {articles.map((article, index) => (
              <div
                key={article.id}
                style={{
                  display: 'flex',
                  minWidth: 0,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '12px 0',
                  borderBottom: index < articles.length - 1
                    ? '1px solid #f0f0f0'
                    : undefined,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <Typography.Text strong>{article.title}</Typography.Text>
                  <div>
                    <Typography.Text type="secondary">
                      {`创建人：${article.ownerName}`}
                    </Typography.Text>
                  </div>
                </div>
                <div style={{ flex: '0 0 auto' }}>
                  <PermissionGuard
                    permission="article:update"
                    resource={article}
                    fallback={<Button disabled>编辑</Button>}
                  >
                    <Button onClick={() => void messageApi.success(`可编辑：${article.title}`)}>
                      编辑
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </PermissionProvider>

      <Card title="使用方法">
        <Alert
          showIcon
          type="warning"
          title="前端权限只控制界面和交互，后端接口仍必须独立鉴权。"
          style={{ marginBottom: 16 }}
        />
        <Collapse
          items={[
            { key: 'provider', label: '1. 根节点注入权限', children: <CodeBlock>{providerCode}</CodeBlock> },
            { key: 'guard', label: '2. 包裹需要控制的组件', children: <CodeBlock>{guardCode}</CodeBlock> },
            { key: 'hook', label: '3. Hook 中过滤菜单或校验操作', children: <CodeBlock>{hookCode}</CodeBlock> },
            { key: 'resource', label: '4. 传入业务资源', children: <CodeBlock>{resourceCode}</CodeBlock> },
          ]}
        />
      </Card>
    </Space>
  );
}

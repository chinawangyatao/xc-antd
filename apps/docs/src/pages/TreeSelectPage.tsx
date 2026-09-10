import { useState } from 'react';
import { ListPanel, ListTree } from '@zhilv/xc-antd';
import {
    Alert,
    Card,
    Col,
    Descriptions,
    message,
    Row,
    Typography,
    type TreeDataNode,
} from 'antd';

type ScenicNodeType = 'scenic' | 'station' | 'window';

interface DepartmentItem {
    id: string;
    title: string;
    subTitle: string;
    category: 'product' | 'technology';
    disabled?: boolean;
}

interface ScenicTreeNode extends Omit<TreeDataNode, 'children'> {
  nodeType?: ScenicNodeType;
  children?: ScenicTreeNode[];
}

const treeData: ScenicTreeNode[] = [
    {
        title: '崂山风景区',
        key: '0-0',
        children: [
            {
                title: '南线游览路线',
                key: '0-0-0',
                nodeType: 'scenic',
                children: [
                    {
                        title: '太清游览区',
                        key: '0-0-0-0',
                        nodeType: 'scenic',
                        children: [
                            {
                                title: '八水河售票站',
                                key: '0-0-0-0-0',
                                nodeType: 'station',
                                children: [
                                    {
                                        title: '八水河信创窗口01',
                                        key: '0-0-0-0-0-0',
                                        nodeType: 'window',
                                    },
                                    {
                                        title: '八水河普通窗口01',
                                        key: '0-0-0-0-0-1',
                                        nodeType: 'window',
                                    }]
                            },
                            {
                                title: '太清广场售票站',
                                key: '0-0-0-0-1',
                                nodeType: 'station',
                            }
                        ]
                    },
                    {
                        title: '巨峰游览区',
                        key: '0-0-0-1',
                        nodeType: 'scenic',
                    },
                    {
                        title: '仰口游览区',
                        key: '0-0-0-2',
                        nodeType: 'scenic',
                    },
                    {
                        title: '南线码头售票站',
                        key: '0-0-0-3',
                        nodeType: 'station',
                        children: [
                            {
                                title: '南线码头独立售票窗口',
                                key: '0-0-0-3-0',
                                nodeType: 'window',
                            }
                        ]
                    },
                ],
            },
            {
                title: '九水游览路线',
                key: '0-1',
                nodeType: 'scenic',
                children: [
                    {
                        title: '九水游览区',
                        key: '0-1-0',
                        nodeType: 'scenic',
                    },
                ]
            },
            {
                title: '二龙山游览路线',
                key: '0-2',
                nodeType: 'scenic',
                children: [
                    {
                        title: '二龙山票区',
                        key: '0-2-0',
                        nodeType: 'scenic',
                    },
                ]
            },
        ],
    },
];

const departmentData: DepartmentItem[] = [
    {
        id: 'product-toc',
        title: '产品1组 (toC)',
        subTitle: '面向个人用户的产品',
        category: 'product',
    },
    {
        id: 'product-tob',
        title: '产品2组 (toB)',
        subTitle: '面向企业客户的产品',
        category: 'product',
    },
    {
        id: 'frontend',
        title: '前端部',
        subTitle: 'Web 与移动端开发',
        category: 'technology',
    },
    {
        id: 'backend',
        title: '后端部',
        subTitle: '服务端与平台开发',
        category: 'technology',
    },
    {
        id: 'disabled',
        title: '已停用部门',
        subTitle: '禁用状态示例',
        category: 'technology',
        disabled: true,
    },
];

const TreeSelectPage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedNode, setSelectedNode] = useState<ScenicTreeNode>(treeData[0]);
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentItem>(departmentData[0]);
    const [departmentCategory, setDepartmentCategory] = useState<'all' | DepartmentItem['category']>('all');
    const [lastAction, setLastAction] = useState('尚未操作');

    const showAction = (action: string, node?: ScenicTreeNode) => {
        const nodeTitle = node?.title ?? '根节点';
        const actionText = `${action}：${String(nodeTitle)}`;
        setLastAction(actionText);
        void messageApi.success(actionText);
    };

    return (
        <>
            {contextHolder}
            <Typography.Title level={3} style={{ marginTop: 0 }}>
                ListPanel / ListTree 列表组件
            </Typography.Title>
            <Typography.Paragraph type="secondary">
                ListPanel 用于平铺列表，ListTree 用于层级树；两者均支持搜索和鼠标右键菜单。
            </Typography.Paragraph>

            <Row gutter={[16, 16]} align="stretch">
                <Col xs={24} xl={10}>
                    <Card title="ListTree 树列表" styles={{ body: { padding: 16 } }}>
                        <ListTree<ScenicTreeNode>
                            height={520}
                            treeData={treeData}
                            defaultExpandedKeys={['0-0', '0-0-0', '0-1', '0-2']}
                            defaultSelectedKeys={['0-0']}
                            onAdd={() => showAction('添加')}
                            onSelect={(_, info) => {
                                setSelectedNode(info.node as unknown as ScenicTreeNode);
                            }}
                            nodeIcon={(node) => node.nodeType
                                ? <TreeIcon type={node.nodeType} />
                                : null}
                            contextMenu={{
                                onClick: ({ key, node }) => {
                                    const actionLabels: Record<string, string> = {
                                        addChild: '添加子级',
                                        edit: '编辑',
                                        delete: '删除',
                                    };
                                    showAction(actionLabels[key] ?? key, node);
                                },
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12} xl={7}>
                    <Card title="ListPanel 平铺列表" styles={{ body: { padding: 16 } }}>
                        <ListPanel<DepartmentItem>
                            data={departmentCategory === 'all'
                                ? departmentData
                                : departmentData.filter((item) => item.category === departmentCategory)}
                            title="部门列表"
                            height={430}
                            defaultSelectedKey="product-toc"
                            onAdd={() => showAction('添加列表项')}
                            toolbarSelectProps={{
                                value: departmentCategory,
                                options: [
                                    { value: 'all', label: '全部' },
                                    { value: 'product', label: '产品' },
                                    { value: 'technology', label: '技术' },
                                ],
                                onChange: setDepartmentCategory,
                            }}
                            onSelect={(item, selectedKey) => {
                                if (selectedKey !== null) setSelectedDepartment(item);
                            }}
                            contextMenu={{
                                onClick: ({ key, data }) => {
                                    const action = key === 'delete' ? '删除' : '编辑';
                                    showAction(action, { key: data.id, title: data.title });
                                },
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12} xl={7}>
                    <Card title="交互说明" style={{ height: '100%' }}>
                        <Alert
                            showIcon
                            type="info"
                            message="点击树箭头展开或收起；两个组件均可搜索；右键节点或列表项可操作，删除前会二次确认。"
                            style={{ marginBottom: 16 }}
                        />
                        <Descriptions
                            bordered
                            column={1}
                            size="small"
                            items={[
                                {
                                    key: 'selected',
                                    label: '当前树节点',
                                    children: typeof selectedNode.title === 'function'
                                        ? String(selectedNode.key)
                                        : selectedNode.title,
                                },
                                {
                                    key: 'type',
                                    label: '当前列表项',
                                    children: selectedDepartment.title,
                                },
                                {
                                    key: 'action',
                                    label: '最近操作',
                                    children: lastAction,
                                },
                                {
                                    key: 'icon',
                                    label: '图标规则',
                                    children: '景区=景、售票站=点、售票窗口=窗',
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </>
    );
};


function TreeIcon({ type }: { type: ScenicNodeType }) {
    const iconMap = {
        scenic: { title: '景', className: 'bg-black' },
        station: { title: '点', className: 'bg-gray-600' },
        window: { title: '窗', className: 'bg-green-800' },
    } satisfies Record<ScenicNodeType, { title: string; className: string }>;
    const icon = iconMap[type];

    return (
        <span className={`flex size-full items-center justify-center border text-sm text-white ${icon.className}`}>
            {icon.title}
        </span>
    );
}


export default TreeSelectPage;

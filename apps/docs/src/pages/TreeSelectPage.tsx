import { useMemo, useState } from 'react';
import {
    ListPanel,
    ListTree,
} from 'xc-antd';
import {
    Alert,
    Button,
    Card,
    Col,
    Descriptions,
    message,
    Modal,
    Row,
    Space,
    Switch,
    Tooltip,
    Typography,
    type TreeDataNode,
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    ReloadOutlined,
} from '@ant-design/icons';

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

const ROOT_NODE_KEY = '0-0';

const initialTreeData: ScenicTreeNode[] = [
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
                                        title: '八水河普通窗口01（团队及旅行社综合服务）',
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

function filterTreeByNodeType(
    nodes: ScenicTreeNode[],
    nodeType: 'all' | ScenicNodeType,
): ScenicTreeNode[] {
    if (nodeType === 'all') return nodes;

    return nodes.flatMap((node) => {
        if (node.nodeType === nodeType) return [node];
        const children = node.children
            ? filterTreeByNodeType(node.children, nodeType)
            : [];
        return children.length > 0 ? [{ ...node, children }] : [];
    });
}

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
    const [dropModal, dropModalContextHolder] = Modal.useModal();
    const [scenicTreeData, setScenicTreeData] = useState(initialTreeData);
    const [selectedNode, setSelectedNode] = useState<ScenicTreeNode>(initialTreeData[0]);
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentItem>(departmentData[0]);
    const [departmentCategory, setDepartmentCategory] = useState<'all' | DepartmentItem['category']>('all');
    const [treeNodeType, setTreeNodeType] = useState<'all' | ScenicNodeType>('all');
    const [showAddButton, setShowAddButton] = useState(true);
    const [showSearchInput, setShowSearchInput] = useState(true);
    const [showToolbarSelect, setShowToolbarSelect] = useState(true);
    const [horizontalScroll, setHorizontalScroll] = useState(true);
    const [dragEnabled, setDragEnabled] = useState(true);
    const [dropConfirmEnabled, setDropConfirmEnabled] = useState(false);
    const [lastAction, setLastAction] = useState('尚未操作');
    const filteredTreeData = useMemo(
        () => filterTreeByNodeType(scenicTreeData, treeNodeType),
        [scenicTreeData, treeNodeType],
    );

    const showAction = (action: string, node?: ScenicTreeNode) => {
        const nodeTitle = node?.title ?? '根节点';
        const actionText = `${action}：${String(nodeTitle)}`;
        setLastAction(actionText);
        void messageApi.success(actionText);
    };
    const showTreeAction = (key: string, node: ScenicTreeNode) => {
        const actionLabels: Record<string, string> = {
            addChild: '添加子级',
            edit: '编辑',
            delete: '删除',
        };
        showAction(actionLabels[key] ?? key, node);
    };

    return (
        <>
            {contextHolder}
            {dropModalContextHolder}
            <Typography.Title level={3} style={{ marginTop: 0 }}>
                ListPanel / ListTree 列表组件
            </Typography.Title>
            <Typography.Paragraph type="secondary">
                ListPanel 用于平铺列表，ListTree 用于层级树；ListTree 支持前方、子级、后方三段式拖拽，
                拖拽规则和持久化由业务回调注入。
            </Typography.Paragraph>

            <Card size="small" title="交互配置" style={{ marginBottom: 16 }}>
                <Space wrap>
                    <Switch
                        checked={showAddButton}
                        checkedChildren="添加显示"
                        unCheckedChildren="添加隐藏"
                        onChange={setShowAddButton}
                    />
                    <Switch
                        checked={showSearchInput}
                        checkedChildren="搜索显示"
                        unCheckedChildren="搜索隐藏"
                        onChange={setShowSearchInput}
                    />
                    <Switch
                        checked={showToolbarSelect}
                        checkedChildren="下拉显示"
                        unCheckedChildren="下拉隐藏"
                        onChange={setShowToolbarSelect}
                    />
                    <Switch
                        checked={horizontalScroll}
                        checkedChildren="横向滚动开启"
                        unCheckedChildren="横向滚动关闭"
                        onChange={setHorizontalScroll}
                    />
                    <Switch
                        checked={dragEnabled}
                        checkedChildren="拖拽开启"
                        unCheckedChildren="拖拽关闭"
                        onChange={setDragEnabled}
                    />
                    <Switch
                        checked={dropConfirmEnabled}
                        checkedChildren="二次确认开启"
                        unCheckedChildren="二次确认关闭"
                        disabled={!dragEnabled}
                        onChange={setDropConfirmEnabled}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            setScenicTreeData(initialTreeData);
                            setSelectedNode(initialTreeData[0]);
                            setLastAction('树结构已重置');
                            void messageApi.success('树结构已重置');
                        }}
                    >
                        重置树
                    </Button>
                </Space>
            </Card>

            <Row gutter={[16, 16]} align="stretch">
                <Col xs={24} xl={10}>
                    <Card title="ListTree 树列表" styles={{ body: { padding: 16 } }}>
                        <ListTree<ScenicTreeNode>
                            height={520}
                            horizontalScroll={horizontalScroll}
                            treeData={filteredTreeData}
                            defaultExpandedKeys={[
                                '0-0',
                                '0-0-0',
                                '0-0-0-0',
                                '0-0-0-0-0',
                                '0-1',
                                '0-2',
                            ]}
                            defaultSelectedKeys={['0-0']}
                            showAddButton={showAddButton}
                            showSearchInput={showSearchInput}
                            showToolbarSelect={showToolbarSelect}
                            onAdd={() => showAction('添加')}
                            toolbarSelectProps={{
                                value: treeNodeType,
                                options: [
                                    { value: 'all', label: '全部' },
                                    { value: 'scenic', label: '景区' },
                                    { value: 'station', label: '售票站' },
                                    { value: 'window', label: '售票窗口' },
                                ],
                                onChange: setTreeNodeType,
                            }}
                            onSelect={(_, info) => {
                                setSelectedNode(info.node as unknown as ScenicTreeNode);
                            }}
                            dragDrop={dragEnabled && treeNodeType === 'all'
                                ? {
                                    nodeDraggable: (node) => node.key !== ROOT_NODE_KEY,
                                    dropEdgeRatio: 0.25,
                                    onDrop: ({ dragNode, targetParentNode, nextTreeData }) => {
                                        const parentTitle = targetParentNode?.title ?? '根层级';
                                        const actionText = `移动 ${String(dragNode.title)} 到 ${String(parentTitle)}`;
                                        const applyDrop = () => {
                                            setScenicTreeData(nextTreeData);
                                            setLastAction(actionText);
                                            void messageApi.success(actionText);
                                        };
                                        if (!dropConfirmEnabled) {
                                            applyDrop();
                                            return;
                                        }
                                        dropModal.confirm({
                                            title: '确认保存拖动结果',
                                            content: `是否将“${String(dragNode.title)}”移动到“${String(parentTitle)}”？`,
                                            okText: '确认',
                                            cancelText: '取消',
                                            onOk: applyDrop,
                                        });
                                    },
                                    onDropRejected: () => {
                                        const text = '不能拖到节点自身或其后代';
                                        setLastAction(`拖拽被拒绝：${text}`);
                                        void messageApi.warning(text);
                                    },
                                }
                                : undefined}
                            nodeContentRender={(node) => (
                                <span className="group flex w-full min-w-0 items-center gap-1">
                                    {node.nodeType && (
                                        <span className="size-6 shrink-0">
                                            <TreeIcon type={node.nodeType} />
                                        </span>
                                    )}
                                    <span className={horizontalScroll ? 'whitespace-nowrap' : 'truncate'}>
                                        {typeof node.title === 'function' ? String(node.key) : node.title}
                                    </span>
                                    <span
                                        className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                                        style={{ marginInlineStart: 'auto' }}
                                        data-list-tree-drag-ignore="true"
                                        onClick={(event) => event.stopPropagation()}
                                        onDoubleClick={(event) => event.stopPropagation()}
                                        onMouseDown={(event) => event.stopPropagation()}
                                    >
                                        <Tooltip title="添加子级">
                                            <Button
                                                type="text"
                                                size="small"
                                                aria-label="添加子级"
                                                icon={<PlusOutlined />}
                                                onClick={() => showTreeAction('addChild', node)}
                                            />
                                        </Tooltip>
                                        <Tooltip title="编辑">
                                            <Button
                                                type="text"
                                                size="small"
                                                aria-label="编辑"
                                                icon={<EditOutlined />}
                                                onClick={() => showTreeAction('edit', node)}
                                            />
                                        </Tooltip>
                                        <Tooltip title="删除">
                                            <Button
                                                danger
                                                type="text"
                                                size="small"
                                                aria-label="删除"
                                                icon={<DeleteOutlined />}
                                                onClick={() => showTreeAction('delete', node)}
                                            />
                                        </Tooltip>
                                    </span>
                                </span>
                            )}
                            contextMenu={{
                                onClick: ({ key, node }) => {
                                    showTreeAction(key, node);
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
                            showAddButton={showAddButton}
                            showSearchInput={showSearchInput}
                            showToolbarSelect={showToolbarSelect}
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
                            title={!dragEnabled
                                ? '拖拽已关闭，树恢复为普通导航模式。'
                                : treeNodeType !== 'all'
                                    ? '类型筛选展示的是局部树，切换到“全部”后可进行拖拽。'
                                    : dropConfirmEnabled
                                        ? '二次确认已开启：拖拽完成后确认才会更新树结构。'
                                        : '自由拖拽已开启：可调整同级顺序或父级，业务规则可按需注入。'}
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
                                {
                                    key: 'drag',
                                    label: '拖拽规则',
                                    children: dragEnabled
                                        ? dropConfirmEnabled
                                            ? '根节点不可拖；组件阻止成环；移动结果需弹窗确认后生效'
                                            : '根节点不可拖；组件阻止成环；其余层级和排序不受限制'
                                        : '拖拽功能已关闭',
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

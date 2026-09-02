import React from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Popconfirm,
  Select,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  ActionDrawer,
  CrudTable,
  FormGroup,
  type CrudTableAction,
  type CrudTableColumn,
  type CrudTableRequest,
} from '@xc-antd/ui';
import type { Dayjs } from 'dayjs';

interface UserRecord {
  id: number;
  name: string;
  department: 'product' | 'technology' | 'operation';
  role: string;
  status: 'enabled' | 'disabled';
  tags: string[];
  phone: string;
  city: string;
  createdAt: string;
}

interface UserQuery {
  name?: string;
  department?: UserRecord['department'];
  status?: UserRecord['status'];
  city?: string;
  createdAt?: [Dayjs, Dayjs];
  createdAtStart?: string;
  createdAtEnd?: string;
}

const departments = {
  product: { text: '产品中心' },
  technology: { text: '技术中心' },
  operation: { text: '运营中心' },
};

const statuses = {
  enabled: { text: '启用', status: 'Success' },
  disabled: { text: '停用', status: 'Default' },
};

const userTags = {
  vip: { text: 'VIP', color: 'gold' },
  focus: { text: '重点关注', color: 'blue' },
  new: { text: '新用户', color: 'green' },
  risk: { text: '风险', status: 'Error' },
};

const initialMockUsers: UserRecord[] = Array.from({ length: 57 }, (_, index) => ({
  id: index + 1,
  name: ['张伟', '李娜', '王强', '赵敏', '陈晨'][index % 5] + (index + 1),
  department: (['product', 'technology', 'operation'] as const)[index % 3],
  role: ['产品经理', '前端工程师', '运营专员', '后端工程师'][index % 4],
  status: index % 4 === 0 ? 'disabled' : 'enabled',
  tags: index % 4 === 0
    ? ['risk']
    : index % 3 === 0
      ? ['vip', 'focus']
      : ['new'],
  phone: `1380000${String(1000 + index).slice(-4)}`,
  city: ['北京', '上海', '青岛', '杭州'][index % 4],
  createdAt: `2026-${String((index % 8) + 1).padStart(2, '0')}-${String(
    (index % 27) + 1,
  ).padStart(2, '0')} 10:30:00`,
}));

const wait = (duration: number) =>
  new Promise((resolve) => window.setTimeout(resolve, duration));

const CrudTableDemo = () => {
  const actionRef = React.useRef<CrudTableAction<UserRecord, UserQuery>>(null);
  const usersRef = React.useRef(initialMockUsers);
  const [editorForm] = Form.useForm<UserRecord>();
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserRecord>();
  const [selectedRows, setSelectedRows] = React.useState<UserRecord[]>([]);

  const queryUsers = React.useCallback<CrudTableRequest<UserRecord, UserQuery>>(
    async (params, sorter) => {
      await wait(350);
      let result = usersRef.current.filter((user) => {
        if (params.name && !user.name.includes(params.name)) return false;
        if (params.department && user.department !== params.department) return false;
        if (params.status && user.status !== params.status) return false;
        if (params.city && !user.city.includes(params.city)) return false;
        if (params.createdAtStart && user.createdAt < params.createdAtStart) return false;
        if (params.createdAtEnd && user.createdAt > params.createdAtEnd) return false;
        return true;
      });

      const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
      if (activeSorter?.field && activeSorter.order) {
        const field = String(activeSorter.field) as keyof UserRecord;
        result = [...result].sort((a, b) => {
          const compared = String(a[field]).localeCompare(String(b[field]));
          return activeSorter.order === 'ascend' ? compared : -compared;
        });
      }

      const start = (params.current - 1) * params.pageSize;
      return {
        data: result.slice(start, start + params.pageSize),
        total: result.length,
        success: true,
      };
    },
    [],
  );

  const openEditor = (record?: UserRecord) => {
    setEditingUser(record);
    editorForm.setFieldsValue(
      record ?? {
        status: 'enabled',
        department: 'technology',
        tags: ['new'],
      },
    );
    setEditorOpen(true);
  };

  const saveUser = async () => {
    const values = await editorForm.validateFields();
    if (editingUser) {
      usersRef.current = usersRef.current.map((item) =>
        item.id === editingUser.id ? { ...editingUser, ...values } : item,
      );
    } else {
      const nextId = Math.max(0, ...usersRef.current.map((item) => item.id)) + 1;
      usersRef.current = [
        {
          ...values,
          id: nextId,
          createdAt: '2026-09-01 09:00:00',
        },
        ...usersRef.current,
      ];
    }
    await message.success(editingUser ? '保存成功' : '新增成功');
    actionRef.current?.reload(true);
    return true;
  };

  const deleteUsers = async (ids: number[]) => {
    usersRef.current = usersRef.current.filter((item) => !ids.includes(item.id));
    actionRef.current?.clearSelected();
    setSelectedRows([]);
    await message.success(`已删除 ${ids.length} 条数据`);
    actionRef.current?.reload();
  };

  const columns = React.useMemo<CrudTableColumn<UserRecord, UserQuery>[]>(
    () => [
      {
        key: 'index',
        title: '序号',
        valueType: 'indexBorder',
        width: 72,
        fixed: 'left',
        hideInSearch: true,
        disableColumnSetting: true,
      },
      {
        title: '姓名',
        dataIndex: 'name',
        valueType: 'text',
        copyable: true,
        // fixed: 'left',
        sorter: true,
        formItemProps: { rules: [{ max: 20, message: '最多输入 20 个字符' }] },
      },
      {
        title: '部门',
        dataIndex: 'department',
        valueType: 'select',
        valueEnum: departments,
      },
      {
        title: '岗位',
        dataIndex: 'role',
        valueType: 'text',
        hideInSearch: true,
      },
      {
        title: '状态',
        dataIndex: 'status',
        valueType: 'select',
        valueEnum: statuses,
      },
      {
        title: '标签',
        dataIndex: 'tags',
        valueType: 'tag',
        valueEnum: userTags,
        hideInSearch: true,
        width: 180,
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        valueType: 'text',
        hideInSearch: true,
      },
      {
        title: '城市',
        dataIndex: 'city',
        valueType: 'text',
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        valueType: 'dateTime',
        sorter: true,
        search: {
          valueType: 'dateRange',
          transform: (value) => {
            const range = value as [Dayjs, Dayjs] | undefined;
            return {
              createdAtStart: range?.[0],
              createdAtEnd: range?.[1],
            };
          },
        },
      },
    ],
    [],
  );

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        CrudTable
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        配置列同时驱动查询和展示，并完整演示请求分页、选择、自定义列、列拖拽、密度和全屏。
      </Typography.Paragraph>

      <CrudTable<UserRecord, UserQuery>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={queryUsers}
        search={{
          defaultCollapsed: true,
          defaultColsNumber: 3,
          extraActions: ({ form }) => (
            <>
              <Upload
                showUploadList={false}
                beforeUpload={(file) => {
                  void message.success(`已选择文件：${file.name}`);
                  return Upload.LIST_IGNORE;
                }}
              >
                <Tooltip title="上传">
                  <Button aria-label="上传" icon={<UploadOutlined />} />
                </Tooltip>
              </Upload>
              <Tooltip title="导出">
                <Button
                  aria-label="导出"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    const values = form.getFieldsValue(true);
                    void message.info(`按当前条件导出：${JSON.stringify(values)}`);
                  }}
                />
              </Tooltip>
            </>
          ),
        }}
        rowSelection
        onSelectionChange={setSelectedRows}
        rowActions={(record) => (
          <>
            <Tooltip title="编辑">
              <Button
                type="text"
                icon={<EditOutlined />}
                aria-label={`编辑${record.name}`}
                onClick={() => openEditor(record)}
              />
            </Tooltip>
            <Popconfirm
              title="确认删除这条数据？"
              onConfirm={() => deleteUsers([record.id])}
            >
              <Tooltip title="删除">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={`删除${record.name}`}
                />
              </Tooltip>
            </Popconfirm>
          </>
        )}
        toolBarRender={() => (
          <>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>
              新增
            </Button>
            <Popconfirm
              title={`确认删除选中的 ${selectedRows.length} 条数据？`}
              disabled={selectedRows.length === 0}
              onConfirm={() => deleteUsers(selectedRows.map((item) => item.id))}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRows.length === 0}
              >
                批量删除
              </Button>
            </Popconfirm>
          </>
        )}
        columnsState={{
          persistenceKey: 'xc-crud-table-user-demo',
          persistenceType: 'localStorage',
        }}
        pagination={{ defaultPageSize: 10 }}
        adaptiveHeight={{ minHeight: 360, offsetBottom: 24 }}
      />

      <ActionDrawer
        title={editingUser ? '编辑用户' : '新增用户'}
        open={editorOpen}
        size={640}
        form={editorForm}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) {
            editorForm.resetFields();
            setEditingUser(undefined);
          }
        }}
        onConfirm={saveUser}
      >
        <Form form={editorForm} layout="vertical" preserve={false}>
          <FormGroup title="基础信息">
            <Col xs={24} md={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="department" label="部门" rules={[{ required: true }]}>
                <Select
                  options={Object.entries(departments).map(([value, item]) => ({
                    value,
                    label: item.text,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="role" label="岗位" rules={[{ required: true }]}>
                <Input placeholder="请输入岗位" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={Object.entries(statuses).map(([value, item]) => ({
                    value,
                    label: item.text,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="tags" label="标签" rules={[{ required: true }]}>
                <Select
                  mode="multiple"
                  placeholder="请选择标签"
                  options={Object.entries(userTags).map(([value, item]) => ({
                    value,
                    label: item.text,
                  }))}
                />
              </Form.Item>
            </Col>
          </FormGroup>

          <FormGroup title="联系信息">
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="city" label="城市" rules={[{ required: true }]}>
                <Input placeholder="请输入城市" />
              </Form.Item>
            </Col>
          </FormGroup>
        </Form>
      </ActionDrawer>
    </div>
  );
};

export default CrudTableDemo;

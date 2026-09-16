import React from 'react';
import {
  Button,
  message,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  HocTable,
  type HocTableColumn,
  type HocTableNewRowFieldConfig,
  type HocTableValidationRule,
} from 'xc-antd';
import TreeDemo from "./treeDemo.tsx";

interface VoucherRecord {
  id: string;
  createdAt: string;
  productName: string;
  category: 'ticket' | 'annual';
  contactName: string;
  contactMobile: string;
  status: 'enabled' | 'disabled';
}

const productOptions = [
  { label: '巨峰游览区成人门票', value: '巨峰游览区成人门票' },
  { label: '太清游览区联票', value: '太清游览区联票' },
];

const initialData: VoucherRecord[] = Array.from({ length: 18 }, (_, index) => ({
  id: `PZ${String(index + 1).padStart(5, '0')}`,
  createdAt: `2026-09-${String((index % 9) + 1).padStart(2, '0')}`,
  productName: productOptions[index % productOptions.length].value,
  category: index % 3 === 0 ? 'annual' : 'ticket',
  contactName: ['张伟', '李娜', '王强'][index % 3],
  contactMobile: `1380000${String(1000 + index).slice(-4)}`,
  status: index % 4 === 0 ? 'disabled' : 'enabled',
}));

const columns: HocTableColumn<VoucherRecord>[] = [
  {
    key: 'createdAt',
    title: '创建日期',
    dataIndex: 'createdAt',
    filterable: true,
    filterMode: 'date',
    width: 150,
  },
  {
    key: 'id',
    title: '凭证编码',
    dataIndex: 'id',
    filterable: true,
    width: 150,
  },
  {
    key: 'productName',
    title: '凭证名称',
    dataIndex: 'productName',
    filterable: true,
    filterMode: 'select',
    filterOptions: productOptions,
    width: 240,
  },
  {
    key: 'category',
    title: '凭证分类',
    dataIndex: 'category',
    filterable: true,
    filterMode: 'select',
    filterOptions: [
      { label: '普通门票', value: 'ticket' },
      { label: '年卡', value: 'annual' },
    ],
    render: (value) => value === 'annual' ? '年卡' : '普通门票',
    width: 130,
  },
  {
    key: 'contactName',
    title: '联系人',
    dataIndex: 'contactName',
    filterable: true,
    width: 120,
  },
  {
    key: 'contactMobile',
    title: '手机号',
    dataIndex: 'contactMobile',
    filterable: true,
    width: 150,
  },
  {
    key: 'status',
    title: '状态',
    dataIndex: 'status',
    filterable: true,
    filterMode: 'switch',
    switchValue: 'enabled',
    render: (value) => value === 'enabled'
      ? <Tag color="success">启用</Tag>
      : <Tag>停用</Tag>,
    width: 110,
  },
];

const newRowFieldConfig: Partial<
  Record<keyof VoucherRecord, HocTableNewRowFieldConfig>
> = {
  createdAt: { valueType: 'date', placeholder: '请选择日期' },
  id: { valueType: 'text', placeholder: '保存后生成', readonly: true },
  productName: {
    valueType: 'select',
    placeholder: '请选择凭证',
    valueEnum: Object.fromEntries(productOptions.map((item) => [
      item.value,
      { text: item.label },
    ])),
  },
  category: {
    valueType: 'select',
    valueEnum: {
      ticket: { text: '普通门票' },
      annual: { text: '年卡' },
    },
  },
  contactName: { valueType: 'text', placeholder: '请输入联系人' },
  contactMobile: { valueType: 'text', placeholder: '请输入手机号' },
  status: {
    valueType: 'select',
    valueEnum: {
      enabled: { text: '启用' },
      disabled: { text: '停用' },
    },
  },
};

const validationRules: HocTableValidationRule[] = [
  { field: 'createdAt', label: '创建日期' },
  { field: 'productName', label: '凭证名称' },
  { field: 'contactName', label: '联系人' },
  {
    field: 'contactMobile',
    label: '手机号',
    rule: (value) => /^1[3-9]\d{9}$/.test(value) ? null : '手机号格式不正确',
  },
];

export default function HocTableDemo() {
  const [dataSource, setDataSource] = React.useState(initialData);

  const saveRows = async (rows: VoucherRecord[]) => {
    const timestamp = Date.now();
    setDataSource((current) => [
      ...rows.map((row, index) => ({
        ...row,
        id: `PZ${timestamp + index}`,
      })),
      ...current,
    ]);
    await message.success(`已保存 ${rows.length} 条凭证`);
  };

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        HocTable
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        面向本地数据和行内新增场景，支持全局搜索、列级筛选、列设置、密度切换与新增行校验。
      </Typography.Paragraph>

      <HocTable<VoucherRecord>
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        newRowFactory={() => ({
          createdAt: '',
          productName: '',
          category: 'ticket',
          contactName: '',
          contactMobile: '',
          status: 'enabled',
        })}
        newRowFieldConfig={newRowFieldConfig}
        validationRules={validationRules}
        onSave={saveRows}
        toolBarRender={(
          <Tooltip title="导出当前数据">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => void message.info(`已导出 ${dataSource.length} 条数据`)}
            >
              导出
            </Button>
          </Tooltip>
        )}
        actionRender={({ record }) => (
          <Space size={4}>
            <Tooltip title="编辑">
              <Button
                type="text"
                aria-label={`编辑${record.id}`}
                icon={<EditOutlined />}
                onClick={() => void message.info(`编辑：${record.id}`)}
              />
            </Tooltip>
            <Popconfirm
              title="确认删除该凭证吗？"
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={() => {
                setDataSource((current) => current.filter((item) => item.id !== record.id));
                void message.success('删除成功');
              }}
            >
              <Tooltip title="删除">
                <Button
                  danger
                  type="text"
                  aria-label={`删除${record.id}`}
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        )}
        tableProps={{
          pagination: {
            defaultPageSize: 8,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          },
          scroll: { x: 1080 },
        }}
      />
    </div>
  );
}

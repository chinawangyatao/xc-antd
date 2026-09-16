import React from 'react';
import {Alert, Button, Card, message, Space, Switch, Typography} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import {
  SchemaForm,
  type SchemaFormAction,
  type SchemaFormGroup,
} from 'xc-antd';
import type { Dayjs } from 'dayjs';

type DateValue = string | Dayjs;

interface ProjectFormValues {
  name: string;
  category: 'standard' | 'advanced';
  status: 'active' | 'disabled';
  tags: string[];
  budget: number;
  period: [DateValue, DateValue];
  disabledReason?: string;
  contact: string;
  phone: string;
  notes?: string;
}

interface ProjectSubmitValues extends Omit<ProjectFormValues, 'period'> {
  startDate?: string;
  endDate?: string;
}

const categoryEnum = {
  standard: { text: '标准项目' },
  advanced: { text: '高级项目' },
};

const statusEnum = {
  active: { text: '启用', status: 'Success' },
  disabled: { text: '停用', status: 'Default' },
};

const tagEnum = {
  important: { text: '重点', color: 'blue' },
  internal: { text: '内部', color: 'cyan' },
  urgent: { text: '紧急', status: 'Error' },
};

const formatDate = (value?: DateValue) => {
  if (!value) return undefined;
  return typeof value === 'string' ? value : value.format('YYYY-MM-DD');
};

const schema: SchemaFormGroup<ProjectFormValues, ProjectSubmitValues>[] = [
  {
    key: 'base',
    title: '基础配置',
    fields: [
      {
        name: 'name',
        label: '项目名称',
        valueType: 'text',
        required: true,
        fieldProps: { placeholder: '请输入项目名称' },
      },
      {
        name: 'category',
        label: '项目分类',
        valueType: 'select',
        valueEnum: categoryEnum,
        required: true,
      },
      {
        name: 'status',
        label: '项目状态',
        valueType: 'select',
        valueEnum: statusEnum,
        required: true,
      },
      {
        name: 'budget',
        label: '项目预算',
        valueType: 'money',
        required: true,
        disabled: (values) => values.status === 'disabled',
        fieldProps: { min: 0, precision: 2 },
      },
      {
        name: 'tags',
        label: '项目标签',
        valueType: 'tag',
        valueEnum: tagEnum,
        colProps: { span: 24 },
      },
      {
        name: 'period',
        label: '项目周期',
        valueType: 'dateRange',
        required: true,
        colProps: { span: 24 },
        transform: (value) => {
          const range = value as [DateValue, DateValue] | undefined;
          return {
            startDate: formatDate(range?.[0]),
            endDate: formatDate(range?.[1]),
          };
        },
      },
      {
        name: 'disabledReason',
        label: '停用原因',
        valueType: 'textarea',
        required: true,
        dependencies: ['status'],
        hidden: (values) => values.status !== 'disabled',
        colProps: { span: 24 },
        fieldProps: { placeholder: '请输入停用原因', rows: 3 },
      },
    ],
  },
  {
    key: 'contact',
    title: '联系信息',
    fields: [
      {
        name: 'contact',
        label: '联系人',
        valueType: 'text',
        required: true,
      },
      {
        name: 'phone',
        label: '联系电话',
        valueType: 'text',
        required: true,
        formItemProps: {
          rules: [
            { required: true, message: '请输入联系电话' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
          ],
        },
      },
      {
        name: 'notes',
        label: '备注',
        valueType: 'textarea',
        colProps: { span: 24 },
        fieldProps: { rows: 3, placeholder: '请输入备注' },
      },
    ],
  },
];

const initialValues: ProjectFormValues = {
  name: '智慧文旅升级项目',
  category: 'advanced',
  status: 'active',
  tags: ['important', 'internal'],
  budget: 500000,
  period: ['2026-09-01', '2026-12-31'],
  contact: '张三',
  phone: '13800138000',
  notes: '独立 SchemaForm 示例，不替换 CrudTable 新增用户。',
};

const SchemaFormDemo = () => {
  const actionRef = React.useRef<
    SchemaFormAction<ProjectFormValues, ProjectSubmitValues>
  >(null);
  const [readMode, setReadMode] = React.useState(false);
  const [submittedValues, setSubmittedValues] = React.useState<ProjectSubmitValues>();

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        SchemaForm
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        通过类型安全配置组合 TextField、FormGroup、栅格、校验和字段联动。
      </Typography.Paragraph>

      <Space wrap style={{ marginBottom: 20 }}>
        <span>只读模式</span>
        <Switch checked={readMode} onChange={setReadMode} />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => actionRef.current?.resetFields()}
        >
          外部重置
        </Button>
      </Space>
      <Card>
        <SchemaForm<ProjectFormValues, ProjectSubmitValues>
            actionRef={actionRef}
            schema={schema}
            mode={readMode ? 'read' : 'edit'}
            initialValues={initialValues}
            submitter={{ submitText: '保存配置', resetText: '恢复默认值' }}
            onFinish={async (values) => {
              setSubmittedValues(values);
              await message.success('表单提交成功');
            }}
        />
      </Card>


      {submittedValues && (
        <Alert
          type="success"
          showIcon
          message="提交结果"
          description={(
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(submittedValues, null, 2)}
            </pre>
          )}
        />
      )}
    </div>
  );
};

export default SchemaFormDemo;

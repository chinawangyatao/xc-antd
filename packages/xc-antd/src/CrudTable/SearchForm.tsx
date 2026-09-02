import React from 'react';
import { Button, Col, Form, Row } from 'antd';
import { DownOutlined, ReloadOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { TextField } from '../TextField';
import type {
  CrudTableColumn,
  CrudTableQuery,
  CrudTableSearchConfig,
} from './types';
import { getSearchActionOffset } from './utils';

interface SearchFieldProps<
  RecordType extends object,
  Query extends CrudTableQuery,
> {
  column: CrudTableColumn<RecordType, Query>;
  value?: unknown;
  onChange?: (...args: unknown[]) => void;
}

function SearchField<
  RecordType extends object,
  Query extends CrudTableQuery,
>({ column, value, onChange }: SearchFieldProps<RecordType, Query>) {
  const searchConfig = typeof column.search === 'object' ? column.search : undefined;
  if (column.renderFormItem) {
    return column.renderFormItem({ value, onChange, column });
  }

  const mergedFieldProps = { ...column.fieldProps, ...searchConfig?.fieldProps };
  const fieldStyle = (mergedFieldProps.style ?? {}) as React.CSSProperties;
  const valueType = searchConfig?.valueType ?? column.valueType ?? 'text';
  return (
    <TextField
      mode="edit"
      text={value as React.ReactNode}
      valueType={valueType === 'option' ? 'text' : valueType}
      valueEnum={column.valueEnum as never}
      onChange={onChange}
      fieldProps={{
        allowClear: true,
        placeholder: `${valueType === 'select' ? '请选择' : '请输入'}${
          typeof column.title === 'string' ? column.title : ''
        }`,
        ...mergedFieldProps,
        style: { width: '100%', ...fieldStyle },
      }}
    />
  );
}

export interface CrudTableSearchFormProps<
  RecordType extends object,
  Query extends CrudTableQuery,
> {
  columns: CrudTableColumn<RecordType, Query>[];
  config: CrudTableSearchConfig<Query>;
  form: ReturnType<typeof Form.useForm<Query>>[0];
  loading: boolean;
  onSubmit: (values: Query) => void;
  onReset: (values: Query) => void;
}

export function CrudTableSearchForm<
  RecordType extends object,
  Query extends CrudTableQuery,
>({
  columns,
  config,
  form,
  loading,
  onSubmit,
  onReset,
}: CrudTableSearchFormProps<RecordType, Query>) {
  const isControlled = config.collapsed !== undefined;
  const [innerCollapsed, setInnerCollapsed] = React.useState(
    config.defaultCollapsed ?? true,
  );
  const collapsed = isControlled ? config.collapsed! : innerCollapsed;

  const searchableColumns = React.useMemo(
    () =>
      columns
        .filter(
          (column) =>
            column.dataIndex &&
            column.valueType !== 'option' &&
            !column.hideInSearch &&
            column.search !== false,
        )
        .sort((a, b) => {
          const aOrder = typeof a.search === 'object' ? a.search.order ?? 0 : 0;
          const bOrder = typeof b.search === 'object' ? b.search.order ?? 0 : 0;
          return aOrder - bOrder;
        }),
    [columns],
  );

  const defaultColsNumber = Math.min(
    3,
    Math.max(1, config.defaultColsNumber ?? 3),
  );
  const visibleColumnCount = collapsed
    ? Math.min(searchableColumns.length, defaultColsNumber)
    : searchableColumns.length;
  const canCollapse = searchableColumns.length > defaultColsNumber;

  const setCollapsed = (next: boolean) => {
    if (!isControlled) setInnerCollapsed(next);
    config.onCollapse?.(next);
  };

  const handleReset = () => {
    form.resetFields();
    onReset(form.getFieldsValue(true));
  };
  const extraActions = typeof config.extraActions === 'function'
    ? config.extraActions({
        form,
        loading,
        submit: () => form.submit(),
        reset: handleReset,
      })
    : config.extraActions;

  if (searchableColumns.length === 0) return null;

  return (
    <div className="xc-crud-table__search">
      <Form<Query>
        form={form}
        initialValues={config.initialValues}
        onFinish={onSubmit}
        layout="vertical"
        className="xc-crud-table__search-form"
      >
        <Row gutter={20} align="bottom" className="xc-crud-table__search-row">
          {searchableColumns.map((column, index) => (
            <Col
              key={String(column.key ?? column.dataIndex)}
              xs={24}
              sm={12}
              lg={6}
              style={{ display: index < visibleColumnCount ? undefined : 'none' }}
            >
              <Form.Item
                name={column.dataIndex as never}
                label={column.title}
                preserve
                {...column.formItemProps}
                {...(typeof column.search === 'object'
                  ? column.search.formItemProps
                  : undefined)}
              >
                <SearchField column={column} />
              </Form.Item>
            </Col>
          ))}
          <Col
            xs={24}
            sm={{
              span: 12,
              offset: getSearchActionOffset(visibleColumnCount, 2, 12),
            }}
            lg={{
              span: 6,
              offset: getSearchActionOffset(visibleColumnCount, 4, 6),
            }}
          >
            <Form.Item
              label={<span aria-hidden="true">&nbsp;</span>}
              colon={false}
              className="xc-crud-table__search-actions-item"
            >
              <div className="xc-crud-table__search-actions">
                {canCollapse && (
                  <Button
                    type="link"
                    icon={collapsed ? <DownOutlined /> : <UpOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                  >
                    {collapsed ? '展开' : '收起'}
                  </Button>
                )}
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  disabled={loading}
                >
                  {config.resetText ?? '重置'}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  {config.submitText ?? '查询'}
                </Button>
                {extraActions}
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

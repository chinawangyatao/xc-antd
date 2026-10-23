import React from 'react';
import { Button, Col, Form, Row, theme } from 'antd';
import { DownOutlined, ReloadOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { TextField } from '../TextField';
import { mergeFormControlProps } from '../shared/formControlProps';
import type {
  CrudTableColumn,
  CrudTableQuery,
  CrudTableSearchConfig,
} from './types';
import { getSearchActionOffset } from './utils';
import { getContainerColProps } from './searchLayout';

interface SearchFieldProps<
  RecordType extends object,
  Query extends CrudTableQuery,
> {
  column: CrudTableColumn<RecordType, Query>;
  value?: unknown;
  onChange?: (...args: unknown[]) => void;
  id?: string;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  'aria-describedby'?: string;
  'aria-invalid'?: React.AriaAttributes['aria-invalid'];
  'aria-required'?: React.AriaAttributes['aria-required'];
}

function SearchFieldImpl<
  RecordType extends object,
  Query extends CrudTableQuery,
>({ column, value, onChange, ...injectedProps }: SearchFieldProps<RecordType, Query>, ref: React.ForwardedRef<unknown>) {
  const searchConfig = typeof column.search === 'object' ? column.search : undefined;
  const mergedFieldProps = { ...column.fieldProps, ...searchConfig?.fieldProps };
  const controlProps = mergeFormControlProps(mergedFieldProps, { ...injectedProps, value, onChange });
  if (column.renderFormItem) {
    // eslint-disable-next-line react-hooks/refs -- render prop 仅向实际控件传递 ref，不在此读取 current。
    return column.renderFormItem({
      value,
      onChange,
      column,
      controlProps,
      ref,
    });
  }

  const fieldStyle = (mergedFieldProps.style ?? {}) as React.CSSProperties;
  const valueType = searchConfig?.valueType ?? column.valueType ?? 'text';
  return (
    <TextField
      ref={ref}
      mode="edit"
      text={value as React.ReactNode}
      value={value}
      valueType={valueType === 'option' ? 'text' : valueType}
      valueEnum={column.valueEnum as never}
      fieldProps={{
        allowClear: true,
        placeholder: `${valueType === 'select' ? '请选择' : '请输入'}${
          typeof column.title === 'string' ? column.title : ''
        }`,
        ...controlProps,
        value,
        style: { width: '100%', ...fieldStyle },
      }}
    />
  );
}

const SearchField = React.forwardRef(SearchFieldImpl) as <
  RecordType extends object,
  Query extends CrudTableQuery,
>(props: SearchFieldProps<RecordType, Query> & React.RefAttributes<unknown>) => React.ReactNode;

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
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>();
  const { token } = theme.useToken();
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  const configuredColProps = config.colProps ?? { xs: 24, sm: 12, lg: 6 };
  const colProps = containerWidth === undefined ? configuredColProps : getContainerColProps(
    configuredColProps,
    containerWidth,
    { xs: token.screenXS, sm: token.screenSM, md: token.screenMD, lg: token.screenLG, xl: token.screenXL, xxl: token.screenXXL },
  );
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

  const defaultColsNumber = Math.max(1, Math.floor(config.defaultColsNumber ?? 3));
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

  const span = Number(colProps.span ?? 24);
  const columnsPerRow = span > 0 ? Math.max(1, Math.floor(24 / span)) : 1;
  const actionOffset = getSearchActionOffset(visibleColumnCount, columnsPerRow, span);
  const actionButtons = {
    collapse: canCollapse && (
      <Button
        key="collapse"
        type="link"
        icon={collapsed ? <DownOutlined /> : <UpOutlined />}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? '展开' : '收起'}
      </Button>
    ),
    submit: (
      <Button key="submit" type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
        {config.submitText ?? '查询'}
      </Button>
    ),
    reset: (
      <Button key="reset" icon={<ReloadOutlined />} onClick={handleReset} disabled={loading}>
        {config.resetText ?? '重置'}
      </Button>
    ),
  };

  return (
    <div ref={rootRef} className="xc-crud-table__search">
      <Form<Query>
        {...config.formProps}
        form={form}
        initialValues={config.initialValues}
        onFinish={onSubmit}
        layout={config.formProps?.layout ?? 'vertical'}
        className={['xc-crud-table__search-form', config.formProps?.className].filter(Boolean).join(' ')}
      >
        <Row gutter={token.margin} align="bottom" {...config.rowProps} className={['xc-crud-table__search-row', config.rowProps?.className].filter(Boolean).join(' ')}>
          {searchableColumns.map((column, index) => (
            <Col
              key={String(column.key ?? column.dataIndex)}
              {...colProps}
              style={{ ...colProps.style, display: index < visibleColumnCount ? colProps.style?.display : 'none' }}
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
            {...colProps}
            offset={actionOffset}
          >
            <Form.Item
              label={<span aria-hidden="true">&nbsp;</span>}
              colon={false}
              className="xc-crud-table__search-actions-item"
            >
              <div className="xc-crud-table__search-actions">
                {(config.actionOrder ?? ['collapse', 'submit', 'reset']).map((key) => actionButtons[key])}
                {extraActions}
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { CrudTable, type CrudTableColumn } from '../src/CrudTable';
import { getContainerColProps } from '../src/CrudTable/searchLayout';

const breakpoints = { xs: 480, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1600 };
const columns: CrudTableColumn<Record<string, string>>[] = Array.from({ length: 5 }, (_, index) => ({
  title: `字段${index + 1}`,
  dataIndex: `field${index + 1}`,
}));

describe('CrudTable search layout', () => {
  test('resolves native column breakpoints against the available container', () => {
    const props = { xs: 24, sm: 12, lg: 6 };
    expect(getContainerColProps(props, 1440, breakpoints).span).toBe(6);
    expect(getContainerColProps(props, 848, breakpoints).span).toBe(12);
    expect(getContainerColProps(props, 375, breakpoints).span).toBe(24);
    expect(getContainerColProps({ span: 8, lg: { span: 6, order: 2 } }, 1200, breakpoints))
      .toEqual({ span: 6, order: 2 });
  });

  test('honors four collapsed fields and orders submit before reset', () => {
    const html = renderToStaticMarkup(
      <CrudTable columns={columns} search={{ defaultColsNumber: 4 }} options={false} pagination={false} />,
    ).split('xc-crud-table__toolbar')[0];
    expect(html.match(/display:none/g)).toHaveLength(1);
    expect(html.indexOf('展开')).toBeLessThan(html.indexOf('查询'));
    expect(html.indexOf('查询')).toBeLessThan(html.indexOf('重置'));
  });

  test('allows the legacy action order through configuration', () => {
    const html = renderToStaticMarkup(
      <CrudTable columns={columns} search={{ actionOrder: ['collapse', 'reset', 'submit'] }} options={false} pagination={false} />,
    ).split('xc-crud-table__toolbar')[0];
    expect(html.indexOf('重置')).toBeLessThan(html.indexOf('查询'));
  });

  test('keeps native query controls controlled and linked to their labels', () => {
    const html = renderToStaticMarkup(
      <CrudTable
        columns={[{ title: '名称', dataIndex: 'name', fieldProps: { value: 'stale-value' } }]}
        search={{ initialValues: { name: '初始查询' }, formProps: { name: 'search' } }}
        options={false}
        pagination={false}
      />,
    );
    expect(html).toContain('value="初始查询"');
    expect(html).not.toContain('value="stale-value"');
    expect(html).toContain('for="search_name"');
    expect(html).toContain('id="search_name"');
  });
});

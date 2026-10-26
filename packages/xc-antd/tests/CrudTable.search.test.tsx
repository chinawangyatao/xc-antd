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

  test('shows all fields without a toggle when they fit within two rows', () => {
    const html = renderToStaticMarkup(
      <CrudTable columns={columns} search={{ colProps: { span: 6 } }} options={false} pagination={false} />,
    ).split('xc-crud-table__toolbar')[0];
    expect(html).not.toContain('display:none');
    expect(html).not.toContain('展开');
    expect(html).not.toContain('收起');
  });

  test.each([[1440, 7], [848, 3], [375, 2]])(
    'keeps two rows with room for actions at container width %d',
    (width, visibleCount) => {
      const searchColumns: CrudTableColumn<Record<string, string>>[] = Array.from(
        { length: visibleCount + 1 },
        (_, index) => ({ title: `字段${index + 1}`, dataIndex: `field${index + 1}` }),
      );
      const colProps = getContainerColProps({ xs: 24, sm: 12, lg: 6 }, width, breakpoints);
      const boundaryHtml = renderToStaticMarkup(
        <CrudTable columns={searchColumns.slice(0, visibleCount)} search={{ colProps }} options={false} pagination={false} />,
      ).split('xc-crud-table__toolbar')[0];
      expect(boundaryHtml).not.toContain('display:none');
      expect(boundaryHtml).not.toContain('展开');
      expect(boundaryHtml).not.toContain('收起');

      const collapsedHtml = renderToStaticMarkup(
        <CrudTable columns={searchColumns} search={{ colProps }} options={false} pagination={false} />,
      ).split('xc-crud-table__toolbar')[0];
      expect(collapsedHtml.match(/display:none/g)).toHaveLength(1);
      expect(collapsedHtml).toContain('展开');
      expect(collapsedHtml).toContain('aria-expanded="false"');
      const [visibleHtml, hiddenHtml] = collapsedHtml.split('display:none');
      expect(visibleHtml).toContain(`for="field${visibleCount}"`);
      expect(hiddenHtml).toContain(`for="field${visibleCount + 1}"`);
    },
  );

  test('keeps two rows and hidden field values in controlled collapsed mode', () => {
    const searchColumns: CrudTableColumn<Record<string, string>>[] = Array.from(
      { length: 9 },
      (_, index) => ({ title: `字段${index + 1}`, dataIndex: `field${index + 1}` }),
    );
    const renderSearch = (state: { collapsed?: boolean; defaultCollapsed?: boolean }) => renderToStaticMarkup(
      <CrudTable
        columns={searchColumns}
        search={{ ...state, colProps: { span: 6 }, initialValues: { field9: '保留查询条件' } }}
        options={false}
        pagination={false}
      />,
    ).split('xc-crud-table__toolbar')[0];

    for (const state of [{ collapsed: false }, { defaultCollapsed: false }]) {
      const expandedHtml = renderSearch(state);
      expect(expandedHtml).not.toContain('display:none');
      expect(expandedHtml).toContain('收起');
      expect(expandedHtml).toContain('aria-expanded="true"');
    }

    const collapsedHtml = renderSearch({ collapsed: true, defaultCollapsed: false });
    expect(collapsedHtml.match(/display:none/g)).toHaveLength(2);
    expect(collapsedHtml).toContain('展开');
    expect(collapsedHtml).toContain('value="保留查询条件"');
  });

  test('honors four collapsed fields and orders submit before reset', () => {
    const html = renderToStaticMarkup(
      <CrudTable columns={columns} search={{ defaultColsNumber: 4 }} options={false} pagination={false} />,
    ).split('xc-crud-table__toolbar')[0];
    expect(html.match(/display:none/g)).toHaveLength(1);
    expect(html.indexOf('展开')).toBeLessThan(html.indexOf('查询'));
    expect(html.indexOf('查询')).toBeLessThan(html.indexOf('重置'));
    expect(html).not.toContain('data-icon="search"');
    expect(html).not.toContain('data-icon="reload"');
    expect(html).toContain('data-icon="down"');
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

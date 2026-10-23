import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { CrudTable, type CrudTableColumn } from '../src/CrudTable';

interface Row {
  id: number;
  name: string;
}

const columns: CrudTableColumn<Row>[] = [
  { title: '姓名', dataIndex: 'name' },
];
const rows: Row[] = [{ id: 1, name: '张三' }];

describe('CrudTable defaults', () => {
  test('shows only column settings and uses compact density by default', () => {
    const html = renderToStaticMarkup(
      <CrudTable columns={columns} dataSource={rows} search={false} pagination={false} />,
    );
    expect(html).toContain('aria-label="自定义列"');
    expect(html).not.toContain('aria-label="刷新"');
    expect(html).not.toContain('aria-label="表格密度"');
    expect(html).not.toContain('aria-label="全屏"');
    expect(html).toContain('ant-table-small');
  });

  test('allows callers to enable toolbar actions and choose another density', () => {
    const html = renderToStaticMarkup(
      <CrudTable
        columns={columns}
        dataSource={rows}
        search={false}
        pagination={false}
        defaultSize="middle"
        options={{ reload: true, density: true, fullScreen: true }}
      />,
    );
    expect(html).toContain('aria-label="刷新"');
    expect(html).toContain('aria-label="表格密度"');
    expect(html).toContain('aria-label="全屏"');
    expect(html).toContain('ant-table-medium');
  });
});

describe('CrudTable with only the action column visible', () => {
  test('removes fixed positioning and default horizontal scrolling for the single column', () => {
    const html = renderToStaticMarkup(
      <CrudTable
        columns={columns}
        dataSource={rows}
        search={false}
        pagination={false}
        rowActions={(record) => <button type="button">删除{record.name}</button>}
        columnsState={{ value: { name: { show: false } } }}
        tableProps={{ scroll: { y: 320 } }}
      />,
    );
    expect(html).toContain('删除张三');
    expect(html).toContain('>操作<');
    expect(html).not.toContain('ant-table-fixed-column');
    expect(html).not.toContain('position:sticky');
    expect(html).not.toContain('width:max-content');
  });

  test('restores fixed actions and horizontal scrolling when another column is shown', () => {
    const html = renderToStaticMarkup(
      <CrudTable
        columns={columns}
        dataSource={rows}
        search={false}
        pagination={false}
        rowActions={(record) => <button type="button">删除{record.name}</button>}
        columnsState={{ value: { name: { show: true } } }}
      />,
    );
    expect(html).toContain('ant-table-fixed-column');
    expect(html).toContain('width:max-content');
  });

  test('preserves explicitly configured horizontal scroll width', () => {
    const html = renderToStaticMarkup(
      <CrudTable
        columns={columns}
        dataSource={rows}
        search={false}
        pagination={false}
        rowActions={() => <button type="button">删除</button>}
        columnsState={{ value: { name: { show: false } } }}
        tableProps={{ scroll: { x: 1200 } }}
      />,
    );
    expect(html).toContain('width:1200px');
  });

  test('supports a manually configured fixed action column with row selection', () => {
    const actionColumns: CrudTableColumn<Row>[] = [
      ...columns,
      { key: 'actions', title: '操作', valueType: 'option', fixed: 'right', render: () => '删除' },
    ];
    const html = renderToStaticMarkup(
      <CrudTable
        columns={actionColumns}
        dataSource={rows}
        search={false}
        pagination={false}
        rowSelection
        columnsState={{ value: { name: { show: false } } }}
        tableProps={{ scroll: { y: 320 } }}
      />,
    );
    expect(html).toContain('ant-checkbox');
    expect(html).toContain('>删除<');
    expect(html).not.toContain('ant-table-fixed-column');
    expect(html).not.toContain('width:max-content');
    expect(actionColumns[1].fixed).toBe('right');
  });
});

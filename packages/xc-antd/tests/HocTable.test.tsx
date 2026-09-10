import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  CRUDTable,
  HocTable,
  SimpleTable,
  TableFilter,
  type HocTableColumn,
} from '../src/HocTable';
import { CrudTable } from '../src/CrudTable';

interface Row {
  id: number;
  name: string;
}

const columns: HocTableColumn<Row>[] = [
  { key: 'name', title: '姓名', dataIndex: 'name' },
];

describe('HocTable', () => {
  test('renders a local table with the current component structure', () => {
    const html = renderToStaticMarkup(
      <HocTable<Row>
        columns={columns}
        dataSource={[{ id: 1, name: '张三' }]}
        enableAdd={false}
        showAction={false}
        options={false}
      />,
    );

    expect(html).toContain('xc-hoc-table');
    expect(html).toContain('张三');
    expect(html).not.toContain('xc-hoc-table__toolbar');
  });

  test('keeps SimpleTable as a compatibility alias', () => {
    expect(SimpleTable).toBe(HocTable);
    expect(CRUDTable).toBe(CrudTable);
  });

  test('keeps legacy compound column filters available', () => {
    const html = renderToStaticMarkup(
      <TableFilter.Input title="姓名" visible searchText="张三" />,
    );

    expect(html).toContain('姓名');
    expect(html).toContain('value="张三"');
  });
});

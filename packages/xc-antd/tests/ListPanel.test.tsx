import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ListPanel } from '../src/ListPanel';
import { resolveListToolbarVisibility } from '../src/shared/listToolbar';

const data = [
  { id: 1, title: '产品1组', subTitle: '面向个人用户' },
  { id: 2, title: '产品2组', subTitle: '面向企业用户' },
  { id: 3, title: '测试组', disabled: true },
];

describe('ListPanel', () => {
  test('renders titles, descriptions and disabled state', () => {
    const html = renderToStaticMarkup(
      <ListPanel data={data} searchable={false} showAddButton={false} />,
    );

    expect(html).toContain('产品1组');
    expect(html).toContain('面向个人用户');
    expect(html).toContain('xc-list-panel__item--disabled');
  });

  test('filters by title and description', () => {
    const html = renderToStaticMarkup(
      <ListPanel
        data={data}
        searchable={false}
        showAddButton={false}
        defaultSearchValue="企业"
      />,
    );

    expect(html).not.toContain('产品1组');
    expect(html).toContain('产品2组');
  });

  test('supports field aliases and default selection', () => {
    const html = renderToStaticMarkup(
      <ListPanel
        data={[{ code: 'design', name: '设计部', remark: '视觉设计' }]}
        fieldNames={{ key: 'code', title: 'name', description: 'remark' }}
        defaultSelectedKey="design"
        searchable={false}
        showAddButton={false}
      />,
    );

    expect(html).toContain('设计部');
    expect(html).toContain('xc-list-panel__item--selected');
  });

  test('adds a context-menu trigger to enabled items', () => {
    const html = renderToStaticMarkup(
      <ListPanel
        data={data.slice(0, 1)}
        searchable={false}
        showAddButton={false}
        contextMenu
      />,
    );

    expect(html).toContain('ant-dropdown-trigger');
  });

  test('shows and hides toolbar controls independently', () => {
    expect(resolveListToolbarVisibility({
      searchable: true,
      hasToolbarSelect: true,
      showAddButton: true,
      hasToolbarExtra: false,
    })).toEqual({
      searchInput: true,
      toolbarSelect: true,
      toolbar: true,
    });

    const hiddenHtml = renderToStaticMarkup(
      <ListPanel
        data={data}
        showAddButton={false}
        showSearchInput={false}
        showToolbarSelect={false}
        toolbarSelectProps={{
          options: [{ value: 'all', label: '全部' }],
        }}
      />,
    );

    expect(hiddenHtml).not.toContain('xc-list-panel__toolbar');
  });
});

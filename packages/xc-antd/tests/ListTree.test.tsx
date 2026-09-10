import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ListTree,
  type ListTreeProps,
} from '../src/ListTree';
import { filterListTreeData } from '../src/ListTree/ListTree';

interface TestNode {
  key: string;
  title: string;
  type?: 'route' | 'area';
  children?: TestNode[];
}

const treeData: TestNode[] = [
  {
    key: 'route',
    title: '南线游览路线',
    type: 'route',
    children: [
      { key: 'taiqing', title: '太清游览区', type: 'area' },
      { key: 'jufeng', title: '巨峰游览区', type: 'area' },
    ],
  },
];

describe('ListTree', () => {
  test('keeps ancestors and expands them while filtering', () => {
    const result = filterListTreeData(treeData, '太清');

    expect(result.treeData).toEqual([
      {
        ...treeData[0],
        children: [treeData[0].children?.[0]],
      },
    ]);
    expect(result.expandedKeys).toEqual(['route']);
  });

  test('supports custom node search text', () => {
    const result = filterListTreeData(treeData, 'AREA', {
      getNodeSearchText: (node) => node.type ?? '',
    });

    expect(result.treeData[0].children).toHaveLength(2);
  });

  test('renders icons resolved from node data', () => {
    const props: ListTreeProps<TestNode> = {
      treeData: [
        { key: 'route', title: '南线游览路线', type: 'route' },
        { key: 'area', title: '太清游览区', type: 'area' },
      ],
      searchable: false,
      showAddButton: false,
      nodeIcon: (node) => <span>{node.type === 'route' ? '线' : '景'}</span>,
    };
    const html = renderToStaticMarkup(<ListTree {...props} />);

    expect(html).toContain('线');
    expect(html).toContain('景');
  });

  test('shows icons declared directly on tree nodes', () => {
    const html = renderToStaticMarkup(
      <ListTree
        searchable={false}
        showAddButton={false}
        treeData={[{ key: 'node', title: '节点', icon: <span>自定义图标</span> }]}
      />,
    );

    expect(html).toContain('自定义图标');
  });

  test('keeps expansion uncontrolled when expandedKeys is not provided', () => {
    const html = renderToStaticMarkup(
      <ListTree
        searchable={false}
        showAddButton={false}
        defaultExpandedKeys={['route']}
        treeData={treeData}
      />,
    );

    expect(html).toContain('太清游览区');
  });

  test('wraps node titles with a context-menu trigger', () => {
    const html = renderToStaticMarkup(
      <ListTree
        searchable={false}
        showAddButton={false}
        contextMenu
        treeData={[{ key: 'node', title: '右键节点' }]}
      />,
    );

    expect(html).toContain('ant-dropdown-trigger');
  });
});

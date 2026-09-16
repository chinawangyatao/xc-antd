import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ListTree,
  moveListTreeNode,
  resolveListTreeDropPlacement,
  type ListTreeProps,
} from '../src/ListTree';
import { filterListTreeData } from '../src/ListTree/ListTree';
import { resolveListToolbarVisibility } from '../src/shared/listToolbar';

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

const draggableTreeData: TestNode[] = [
  {
    key: 'root',
    title: '根节点',
    children: [
      {
        key: 'parent-a',
        title: '父节点 A',
        children: [{ key: 'child-a', title: '子节点 A' }],
      },
      { key: 'parent-b', title: '父节点 B' },
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

  test('shows and hides toolbar controls independently', () => {
    expect(resolveListToolbarVisibility({
      searchable: true,
      showSearchInput: false,
      hasToolbarSelect: true,
      showToolbarSelect: false,
      showAddButton: false,
      hasToolbarExtra: false,
    })).toEqual({
      searchInput: false,
      toolbarSelect: false,
      toolbar: false,
    });

    const hiddenHtml = renderToStaticMarkup(
      <ListTree
        treeData={treeData}
        showAddButton={false}
        showSearchInput={false}
        showToolbarSelect={false}
        toolbarSelectProps={{
          options: [{ value: 'all', label: '全部' }],
        }}
      />,
    );

    expect(hiddenHtml).not.toContain('xc-list-tree__toolbar');
  });

  test('resolves before, inside and after drop areas', () => {
    expect(resolveListTreeDropPlacement(2, 20)).toBe('before');
    expect(resolveListTreeDropPlacement(10, 20)).toBe('inside');
    expect(resolveListTreeDropPlacement(18, 20)).toBe('after');
    expect(resolveListTreeDropPlacement(4, 20, 0.2)).toBe('inside');
  });

  test('moves a node immutably into another node', () => {
    const result = moveListTreeNode(
      draggableTreeData,
      'child-a',
      'parent-b',
      'inside',
    );

    expect(result?.dragParentNode?.key).toBe('parent-a');
    expect(result?.targetParentNode?.key).toBe('parent-b');
    expect(result?.nextTreeData[0].children?.[0].children).toEqual([]);
    expect(result?.nextTreeData[0].children?.[1].children?.[0].key).toBe('child-a');
    expect(draggableTreeData[0].children?.[0].children?.[0].key).toBe('child-a');
  });

  test('moves a node before a sibling and rejects descendant drops', () => {
    const moved = moveListTreeNode(
      draggableTreeData,
      'parent-b',
      'parent-a',
      'before',
    );

    expect(moved?.nextTreeData[0].children?.map((node) => node.key)).toEqual([
      'parent-b',
      'parent-a',
    ]);
    expect(moveListTreeNode(
      draggableTreeData,
      'parent-a',
      'child-a',
      'inside',
    )).toBeNull();
  });

  test('supports custom key and children field names', () => {
    const aliasedTree = [
      {
        id: 'root',
        label: '根节点',
        nodes: [
          { id: 'first', label: '节点一' },
          { id: 'second', label: '节点二' },
        ],
      },
    ];
    const result = moveListTreeNode(
      aliasedTree,
      'second',
      'first',
      'before',
      { keyField: 'id', childrenField: 'nodes' },
    );

    expect(result?.nextTreeData[0].nodes.map((node) => node.id)).toEqual([
      'second',
      'first',
    ]);
  });

  test('renders the high-level draggable node contract', () => {
    const html = renderToStaticMarkup(
      <ListTree
        searchable={false}
        showAddButton={false}
        defaultExpandAll
        treeData={draggableTreeData}
        dragDrop={{
          nodeDraggable: (node) => node.key !== 'root',
          onDrop: () => undefined,
        }}
      />,
    );

    expect(html).toContain('xc-list-tree__drag-node');
    expect(html).toContain('draggable="true"');
  });
});

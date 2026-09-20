import {
  Button,
  Dropdown,
  Input,
  Select,
  Tooltip,
  Tree,
  type ButtonProps,
  type InputProps,
  type MenuProps,
  type SelectProps,
  type TreeProps,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { CSSProperties, Key, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  useListDeleteConfirm,
  type ListDeleteConfirmOptions,
} from '../shared/listDeleteConfirm';
import { resolveListToolbarVisibility } from '../shared/listToolbar';
import type { ListTreeDragDropConfig } from './dragDrop';
import { useListTreeDragDrop } from './useListTreeDragDrop';
import './style.css';

type MenuClickInfo = Parameters<NonNullable<MenuProps['onClick']>>[0];

export interface ListTreeDataNode {
  key: Key;
  title?: ReactNode;
  children?: ListTreeDataNode[];
}

export type ListTreeContextMenuClickInfo<TreeDataType extends object = ListTreeDataNode> =
  MenuClickInfo & {
    node: TreeDataType;
  };

export interface ListTreeContextMenu<TreeDataType extends object = ListTreeDataNode> {
  /** 不传时默认显示 addChild / edit / delete 三个菜单项。 */
  items?: MenuProps['items'] | ((node: TreeDataType) => MenuProps['items']);
  onClick?: (info: ListTreeContextMenuClickInfo<TreeDataType>) => void | Promise<void>;
}

export interface ListTreeProps<TreeDataType extends object = ListTreeDataNode>
  extends Omit<TreeProps, 'className' | 'style' | 'titleRender' | 'treeData'> {
  treeData?: TreeDataType[];
  className?: string;
  style?: CSSProperties;
  treeClassName?: string;
  treeStyle?: CSSProperties;
  /** 是否允许树内容超出父容器后横向滚动，默认开启；开启时优先于 virtual。 */
  horizontalScroll?: boolean;

  searchable?: boolean;
  /** 是否显示搜索输入框，优先级高于 searchable。 */
  showSearchInput?: boolean;
  searchValue?: string;
  defaultSearchValue?: string;
  searchPlaceholder?: string;
  searchInputProps?: Omit<InputProps, 'defaultValue' | 'value'>;
  onSearchChange?: (value: string) => void;
  getNodeSearchText?: (node: TreeDataType) => string;
  autoExpandOnSearch?: boolean;

  /** 下拉筛选配置，传入后默认显示。 */
  toolbarSelectProps?: SelectProps;
  /** 是否显示已配置的下拉筛选。 */
  showToolbarSelect?: boolean;
  /** 默认显示左上角的添加按钮。 */
  showAddButton?: boolean;
  addButtonProps?: Omit<ButtonProps, 'onClick'>;
  onAdd?: () => void;
  toolbarExtra?: ReactNode;

  /** 用于按节点数据生成图标；treeData 中的 icon 优先级更高。 */
  nodeIcon?: ReactNode | ((node: TreeDataType) => ReactNode);
  /** 启用节点右键菜单；传 true 使用默认菜单。 */
  contextMenu?: true | ListTreeContextMenu<TreeDataType>;
  /** 是否在节点行悬停或聚焦时显示 contextMenu 中的快捷操作，默认开启。 */
  showRowActions?: boolean;
  /** 右键删除的二次确认，默认开启。 */
  deleteConfirm?: ListDeleteConfirmOptions;
  /**
   * 标准三段式拖拽配置。传入后由 ListTree 管理拖拽预览、落点反馈和不可变树变换，
   * 并暂停 Ant Design Tree 自身的 draggable 行为。
   */
  dragDrop?: ListTreeDragDropConfig<TreeDataType>;
  titleRender?: (node: TreeDataType) => ReactNode;
}

interface FilterTreeOptions<TreeDataType extends object> {
  childrenField?: string;
  keyField?: string;
  titleField?: string;
  getNodeSearchText?: (node: TreeDataType) => string;
}

export interface FilterListTreeResult<TreeDataType extends object> {
  treeData: TreeDataType[];
  expandedKeys: Key[];
}

const defaultContextMenuItems: MenuProps['items'] = [
  { key: 'addChild', label: '添加子级', icon: <PlusOutlined /> },
  { key: 'edit', label: '编辑', icon: <EditOutlined /> },
  { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
];

interface ListTreeRowActionItem {
  key: string | number;
  label?: ReactNode;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

type ListTreeMenuItem = NonNullable<MenuProps['items']>[number];

function getRowActionItems(items: MenuProps['items']): ListTreeRowActionItem[] {
  return (items ?? []).flatMap((item: ListTreeMenuItem) => {
    if (!item || typeof item !== 'object') return [];

    const record = item as unknown as Record<string, unknown>;
    if (
      record.type === 'divider'
      || record.type === 'group'
      || record.type === 'submenu'
      || Array.isArray(record.children)
    ) {
      return [];
    }

    const key = record.key;
    if (typeof key !== 'string' && typeof key !== 'number') return [];

    return [{
      key,
      label: record.label as ReactNode,
      icon: record.icon as ReactNode,
      danger: Boolean(record.danger),
      disabled: Boolean(record.disabled),
    }];
  });
}

function getRowActionLabel(item: ListTreeRowActionItem): string {
  return typeof item.label === 'string' || typeof item.label === 'number'
    ? String(item.label)
    : String(item.key);
}

function getRecord(node: object): Record<string, unknown> {
  return node as Record<string, unknown>;
}

function getChildren<TreeDataType extends object>(
  node: TreeDataType,
  childrenField: string,
): TreeDataType[] | undefined {
  const children = getRecord(node)[childrenField];
  return Array.isArray(children) ? children as TreeDataType[] : undefined;
}

function getDefaultSearchText<TreeDataType extends object>(
  node: TreeDataType,
  titleField: string,
): string {
  const title = getRecord(node)[titleField];
  return typeof title === 'string' || typeof title === 'number' ? String(title) : '';
}

/**
 * 按关键字过滤树，保留命中节点的祖先链。
 * 函数不修改原始 treeData，可用于单独测试或业务层预处理。
 */
export function filterListTreeData<TreeDataType extends object>(
  treeData: TreeDataType[],
  searchValue: string,
  options: FilterTreeOptions<TreeDataType> = {},
): FilterListTreeResult<TreeDataType> {
  const keyword = searchValue.trim().toLocaleLowerCase();
  if (!keyword) {
    return { treeData, expandedKeys: [] };
  }

  const childrenField = options.childrenField ?? 'children';
  const keyField = options.keyField ?? 'key';
  const titleField = options.titleField ?? 'title';
  const expandedKeys: Key[] = [];

  const filterNodes = (nodes: TreeDataType[]): TreeDataType[] => {
    const result: TreeDataType[] = [];

    for (const node of nodes) {
      const children = getChildren(node, childrenField);
      const filteredChildren = children ? filterNodes(children) : [];
      const searchText = options.getNodeSearchText?.(node)
        ?? getDefaultSearchText(node, titleField);
      const matches = searchText.toLocaleLowerCase().includes(keyword);

      if (!matches && filteredChildren.length === 0) continue;

      const visibleChildren = matches ? children : filteredChildren;
      if (visibleChildren?.length) {
        const nodeKey = getRecord(node)[keyField];
        if (typeof nodeKey === 'string' || typeof nodeKey === 'number') {
          expandedKeys.push(nodeKey);
        }
      }

      if (visibleChildren === children) {
        result.push(node);
      } else {
        result.push({
          ...node,
          [childrenField]: visibleChildren,
        });
      }
    }

    return result;
  };

  return { treeData: filterNodes(treeData), expandedKeys };
}

function decorateNodeIcons<TreeDataType extends object>(
  treeData: TreeDataType[],
  childrenField: string,
  nodeIcon: NonNullable<ListTreeProps<TreeDataType>['nodeIcon']>,
): TreeDataType[] {
  return treeData.map((node) => {
    const record = getRecord(node);
    const children = getChildren(node, childrenField);
    const resolvedIcon = record.icon !== undefined
      ? record.icon
      : typeof nodeIcon === 'function'
        ? nodeIcon(node)
        : nodeIcon;

    return {
      ...node,
      icon: resolvedIcon,
      ...(children
        ? { [childrenField]: decorateNodeIcons(children, childrenField, nodeIcon) }
        : {}),
    };
  });
}

function hasNodeIcon<TreeDataType extends object>(
  treeData: TreeDataType[],
  childrenField: string,
): boolean {
  return treeData.some((node) => {
    if (getRecord(node).icon !== undefined) return true;
    const children = getChildren(node, childrenField);
    return children ? hasNodeIcon(children, childrenField) : false;
  });
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

export function ListTree<TreeDataType extends object = ListTreeDataNode>({
  treeData = [],
  className,
  style,
  treeClassName,
  treeStyle,
  horizontalScroll = true,
  searchable = true,
  showSearchInput,
  searchValue,
  defaultSearchValue = '',
  searchPlaceholder = '请输入',
  searchInputProps,
  onSearchChange,
  getNodeSearchText,
  autoExpandOnSearch = true,
  toolbarSelectProps,
  showToolbarSelect,
  showAddButton,
  addButtonProps,
  onAdd,
  toolbarExtra,
  nodeIcon,
  contextMenu,
  showRowActions = true,
  deleteConfirm,
  dragDrop,
  fieldNames,
  defaultExpandedKeys,
  expandedKeys,
  onExpand,
  titleRender,
  showIcon,
  blockNode,
  draggable: nativeDraggable,
  virtual,
  ...treeProps
}: ListTreeProps<TreeDataType>) {
  const [innerSearchValue, setInnerSearchValue] = useState(defaultSearchValue);
  const { confirmDelete, contextHolder } = useListDeleteConfirm({
    title: '确认删除该节点吗？',
    content: '删除后该节点及其下级数据将无法恢复。',
  });
  const mergedSearchValue = searchValue ?? innerSearchValue;
  const childrenField = fieldNames?.children ?? 'children';
  const keyField = fieldNames?.key ?? 'key';
  const titleField = fieldNames?.title ?? 'title';
  const { getDragNodeProps } = useListTreeDragDrop({
    treeData,
    childrenField,
    keyField,
    dragDrop,
  });

  const filteredResult = useMemo(
    () => filterListTreeData(treeData, mergedSearchValue, {
      childrenField,
      keyField,
      titleField,
      getNodeSearchText,
    }),
    [childrenField, getNodeSearchText, keyField, mergedSearchValue, titleField, treeData],
  );

  const visibleTreeData = useMemo(
    () => nodeIcon
      ? decorateNodeIcons(filteredResult.treeData, childrenField, nodeIcon)
      : filteredResult.treeData,
    [childrenField, filteredResult.treeData, nodeIcon],
  );
  const treeDataHasIcon = useMemo(
    () => hasNodeIcon(treeData, childrenField),
    [childrenField, treeData],
  );

  const resolvedExpandedKeys = expandedKeys
    ?? (mergedSearchValue.trim() && autoExpandOnSearch
      ? filteredResult.expandedKeys
      : undefined);
  const controlledExpansionProps = resolvedExpandedKeys === undefined
    ? {}
    : { expandedKeys: resolvedExpandedKeys };
  const shouldShowAddButton = showAddButton ?? true;
  const toolbarVisibility = resolveListToolbarVisibility({
    searchable,
    showSearchInput,
    hasToolbarSelect: Boolean(toolbarSelectProps),
    showToolbarSelect,
    showAddButton: shouldShowAddButton,
    hasToolbarExtra: Boolean(toolbarExtra),
  });
  const {
    onChange: onSearchInputChange,
    ...restSearchInputProps
  } = searchInputProps ?? {};
  const {
    className: selectClassName,
    ...restToolbarSelectProps
  } = toolbarSelectProps ?? {};

  const renderTitle = (node: TreeDataType) => {
    const rawTitle = titleRender
      ? titleRender(node)
      : getRecord(node)[titleField];
    const title = typeof rawTitle === 'function' ? rawTitle(node) : rawTitle as ReactNode;
    const contextMenuOptions = contextMenu
      ? contextMenu === true ? {} : contextMenu
      : null;
    let contextMenuItems: MenuProps['items'] | undefined;
    if (contextMenuOptions) {
      contextMenuItems = typeof contextMenuOptions.items === 'function'
        ? contextMenuOptions.items(node)
        : contextMenuOptions.items ?? defaultContextMenuItems;
    }
    const rowActionItems = contextMenuOptions?.onClick && showRowActions
      ? getRowActionItems(contextMenuItems)
      : [];
    const rowActionWidth = rowActionItems.length > 0
      ? rowActionItems.length * 24 + (rowActionItems.length - 1) * 2 + 4
      : 0;
    const handleContextMenuClick: NonNullable<MenuProps['onClick']> | undefined = (
      contextMenuOptions && contextMenuItems?.length
    )
      ? (info) => {
        const emitClick = () => contextMenuOptions.onClick?.({ ...info, node });
        if (info.key === 'delete') {
          confirmDelete(deleteConfirm, emitClick);
        } else {
          void emitClick();
        }
      }
      : undefined;

    let renderedLabel = (
      <span className="xc-list-tree__node-title">{title}</span>
    );

    if (!horizontalScroll) {
      renderedLabel = (
        <Tooltip placement="topLeft" title={title}>
          {renderedLabel}
        </Tooltip>
      );
    }

    const renderedNodeContent = (
      <span className="xc-list-tree__node-content">
        {renderedLabel}
        {rowActionItems.length > 0 && (
          <span
            className="xc-list-tree__row-actions"
            data-list-tree-drag-ignore="true"
            style={{
              '--xc-list-tree-row-actions-width': `${rowActionWidth}px`,
            } as CSSProperties}
          >
            {rowActionItems.map((item) => {
              const label = getRowActionLabel(item);
              return (
                <Tooltip key={item.key} title={item.label ?? label}>
                  <Button
                    type="text"
                    size="small"
                    aria-label={label}
                    title={label}
                    danger={item.danger}
                    disabled={item.disabled}
                    icon={item.icon}
                    data-list-tree-drag-ignore="true"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleContextMenuClick?.({
                        key: String(item.key),
                        keyPath: [String(item.key)],
                        item: item as unknown as MenuClickInfo['item'],
                        domEvent: event,
                        itemData: {
                          key: item.key,
                          label: item.label,
                          title: typeof item.label === 'string' ? item.label : undefined,
                        },
                      });
                    }}
                  >
                    {!item.icon && item.label}
                  </Button>
                </Tooltip>
              );
            })}
          </span>
        )}
      </span>
    );

    let renderedTitle: ReactNode = renderedNodeContent;
    if (contextMenuItems?.length && handleContextMenuClick) {
      renderedTitle = (
        <Dropdown
          trigger={['contextMenu']}
          menu={{
            items: contextMenuItems,
            onClick: handleContextMenuClick,
          }}
        >
          {renderedNodeContent}
        </Dropdown>
      );
    }

    const dragNodeProps = getDragNodeProps(node);
    if (!dragNodeProps) return renderedTitle;

    return (
      <span {...dragNodeProps}>
        {renderedTitle}
      </span>
    );
  };

  return (
    <div
      className={joinClassNames(
        'xc-list-tree',
        horizontalScroll ? 'xc-list-tree--horizontal-scroll' : undefined,
        className,
      )}
      style={style}
    >
      {contextHolder}
      {toolbarVisibility.toolbar && (
        <div className="xc-list-tree__toolbar">
          {shouldShowAddButton && (
            <Button
              aria-label="添加"
              {...addButtonProps}
              icon={addButtonProps?.icon ?? <PlusOutlined />}
              onClick={onAdd}
            />
          )}
          {toolbarVisibility.toolbarSelect && (
            <Select
              placeholder="请选择"
              {...restToolbarSelectProps}
              className={joinClassNames('xc-list-tree__select', selectClassName)}
            />
          )}
          {toolbarExtra}
          {toolbarVisibility.searchInput && (
            <Input
              allowClear
              aria-label="搜索树节点"
              placeholder={searchPlaceholder}
              suffix={<SearchOutlined />}
              {...restSearchInputProps}
              className={joinClassNames(
                'xc-list-tree__search',
                restSearchInputProps.className,
              )}
              value={mergedSearchValue}
              onChange={(event) => {
                onSearchInputChange?.(event);
                const value = event.target.value;
                if (searchValue === undefined) setInnerSearchValue(value);
                onSearchChange?.(value);
              }}
            />
          )}
        </div>
      )}

      <Tree
        {...treeProps}
        className={joinClassNames('xc-list-tree__tree', treeClassName)}
        style={treeStyle}
        fieldNames={fieldNames}
        treeData={visibleTreeData as unknown as NonNullable<TreeProps['treeData']>}
        blockNode={blockNode ?? true}
        draggable={dragDrop ? false : nativeDraggable}
        virtual={horizontalScroll ? false : virtual}
        showIcon={showIcon ?? (Boolean(nodeIcon) || treeDataHasIcon)}
        defaultExpandedKeys={defaultExpandedKeys}
        {...controlledExpansionProps}
        onExpand={(keys, info) => {
          onExpand?.(keys, info);
        }}
        titleRender={renderTitle as TreeProps['titleRender']}
      />
    </div>
  );
}

export default ListTree;

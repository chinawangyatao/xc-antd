import {
  Button,
  Divider,
  Dropdown,
  Empty,
  Input,
  Select,
  type ButtonProps,
  type InputProps,
  type MenuProps,
  type SelectProps,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { CSSProperties, Key, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  useListDeleteConfirm,
  type ListDeleteConfirmOptions,
} from '../shared/listDeleteConfirm';
import { resolveListToolbarVisibility } from '../shared/listToolbar';
import './style.css';

type MenuClickInfo = Parameters<NonNullable<MenuProps['onClick']>>[0];

export interface ListPanelDataItem {
  id: Key;
  title?: ReactNode;
  subTitle?: ReactNode;
  disabled?: boolean;
}

export interface ListPanelFieldNames {
  key?: string;
  title?: string;
  description?: string;
  disabled?: string;
}

export type ListPanelContextMenuClickInfo<ItemType extends object = ListPanelDataItem> =
  MenuClickInfo & {
    data: ItemType;
  };

export interface ListPanelContextMenu<ItemType extends object = ListPanelDataItem> {
  /** 不传时默认显示 edit / delete 两个菜单项。 */
  items?: MenuProps['items'] | ((item: ItemType) => MenuProps['items']);
  onClick?: (info: ListPanelContextMenuClickInfo<ItemType>) => void | Promise<void>;
}

export interface ListPanelRenderInfo {
  disabled: boolean;
  selected: boolean;
}

export interface ListPanelProps<ItemType extends object = ListPanelDataItem> {
  data?: ItemType[];
  fieldNames?: ListPanelFieldNames;
  getItemKey?: (item: ItemType, index: number) => Key;
  renderItem?: (item: ItemType, info: ListPanelRenderInfo) => ReactNode;

  selectedKey?: Key | null;
  defaultSelectedKey?: Key | null;
  allowDeselect?: boolean;
  onSelect?: (item: ItemType, selectedKey: Key | null) => void;

  searchable?: boolean;
  /** 是否显示搜索输入框，优先级高于 searchable。 */
  showSearchInput?: boolean;
  searchValue?: string;
  defaultSearchValue?: string;
  searchPlaceholder?: string;
  searchInputProps?: Omit<InputProps, 'defaultValue' | 'value'>;
  getItemSearchText?: (item: ItemType) => string;
  onSearchChange?: (value: string) => void;

  /** 下拉筛选配置，传入后默认显示。 */
  toolbarSelectProps?: SelectProps;
  /** 是否显示已配置的下拉筛选。 */
  showToolbarSelect?: boolean;
  /** 是否显示添加按钮，默认显示。 */
  showAddButton?: boolean;
  addButtonProps?: Omit<ButtonProps, 'onClick'>;
  onAdd?: () => void;
  toolbarExtra?: ReactNode;

  title?: ReactNode;
  emptyText?: ReactNode;
  height?: number | string;
  maxHeight?: number | string;
  contextMenu?: true | ListPanelContextMenu<ItemType>;
  /** 右键删除的二次确认，默认开启。 */
  deleteConfirm?: ListDeleteConfirmOptions;
  className?: string;
  style?: CSSProperties;
}

const defaultContextMenuItems: MenuProps['items'] = [
  { key: 'edit', label: '编辑', icon: <EditOutlined /> },
  { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
];

const defaultFieldNames: Required<ListPanelFieldNames> = {
  key: 'id',
  title: 'title',
  description: 'subTitle',
  disabled: 'disabled',
};

function getRecord(item: object): Record<string, unknown> {
  return item as Record<string, unknown>;
}

function joinClassNames(...classNames: Array<string | undefined | false>): string {
  return classNames.filter(Boolean).join(' ');
}

function getText(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

export function ListPanel<ItemType extends object = ListPanelDataItem>({
  data = [],
  fieldNames,
  getItemKey,
  renderItem,
  selectedKey,
  defaultSelectedKey = null,
  allowDeselect = true,
  onSelect,
  searchable = true,
  showSearchInput,
  searchValue,
  defaultSearchValue = '',
  searchPlaceholder = '请输入内容',
  searchInputProps,
  getItemSearchText,
  onSearchChange,
  toolbarSelectProps,
  showToolbarSelect,
  showAddButton,
  addButtonProps,
  onAdd,
  toolbarExtra,
  title,
  emptyText = '暂无数据',
  height,
  maxHeight,
  contextMenu,
  deleteConfirm,
  className,
  style,
}: ListPanelProps<ItemType>) {
  const [innerSelectedKey, setInnerSelectedKey] = useState<Key | null>(defaultSelectedKey);
  const [innerSearchValue, setInnerSearchValue] = useState(defaultSearchValue);
  const { confirmDelete, contextHolder } = useListDeleteConfirm({
    title: '确认删除该列表项吗？',
    content: '删除后无法恢复，请谨慎操作。',
  });
  const mergedSelectedKey = selectedKey === undefined ? innerSelectedKey : selectedKey;
  const mergedSearchValue = searchValue ?? innerSearchValue;
  const resolvedFieldNames = { ...defaultFieldNames, ...fieldNames };
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

  const resolveItemKey = (item: ItemType, index: number): Key => {
    if (getItemKey) return getItemKey(item, index);
    const key = getRecord(item)[resolvedFieldNames.key];
    return typeof key === 'string' || typeof key === 'number' ? key : index;
  };

  const visibleData = useMemo(() => {
    const keyword = mergedSearchValue.trim().toLocaleLowerCase();
    if (!keyword) return data;

    return data.filter((item) => {
      const record = getRecord(item);
      const searchText = getItemSearchText?.(item)
        ?? [
          getText(record[resolvedFieldNames.title]),
          getText(record[resolvedFieldNames.description]),
        ].filter(Boolean).join(' ');
      return searchText.toLocaleLowerCase().includes(keyword);
    });
  }, [
    data,
    getItemSearchText,
    mergedSearchValue,
    resolvedFieldNames.description,
    resolvedFieldNames.title,
  ]);

  const selectItem = (item: ItemType, itemKey: Key, disabled: boolean) => {
    if (disabled) return;
    const nextSelectedKey = allowDeselect && mergedSelectedKey === itemKey
      ? null
      : itemKey;
    if (selectedKey === undefined) setInnerSelectedKey(nextSelectedKey);
    onSelect?.(item, nextSelectedKey);
  };

  return (
    <div className={joinClassNames('xc-list-panel', className)} style={style}>
      {contextHolder}
      {toolbarVisibility.toolbar && (
        <div className="xc-list-panel__toolbar">
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
              className={joinClassNames('xc-list-panel__select', selectClassName)}
            />
          )}
          {toolbarExtra}
          {toolbarVisibility.searchInput && (
            <Input
              allowClear
              aria-label="搜索列表"
              placeholder={searchPlaceholder}
              suffix={<SearchOutlined />}
              {...restSearchInputProps}
              className={joinClassNames(
                'xc-list-panel__search',
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

      {title && (
        <div className="xc-list-panel__header">
          <span className="xc-list-panel__header-title">{title}</span>
          <Divider />
        </div>
      )}

      <div
        className="xc-list-panel__body"
        role="listbox"
        style={{
          height,
          maxHeight,
        }}
      >
        {visibleData.length === 0
          ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
          : visibleData.map((item, index) => {
            const record = getRecord(item);
            const itemKey = resolveItemKey(item, index);
            const disabled = Boolean(record[resolvedFieldNames.disabled]);
            const selected = !disabled && mergedSelectedKey === itemKey;
            const content = renderItem
              ? renderItem(item, { disabled, selected })
              : (
                <>
                  <span className="xc-list-panel__item-title">
                    {record[resolvedFieldNames.title] as ReactNode}
                  </span>
                  {record[resolvedFieldNames.description] != null && (
                    <span className="xc-list-panel__item-description">
                      {record[resolvedFieldNames.description] as ReactNode}
                    </span>
                  )}
                </>
              );
            const itemNode = (
              <button
                type="button"
                role="option"
                aria-selected={selected}
                disabled={disabled}
                className={joinClassNames(
                  'xc-list-panel__item',
                  selected && 'xc-list-panel__item--selected',
                  disabled && 'xc-list-panel__item--disabled',
                )}
                onClick={() => selectItem(item, itemKey, disabled)}
              >
                {content}
              </button>
            );

            if (!contextMenu || disabled) {
              return <div key={itemKey}>{itemNode}</div>;
            }

            const contextMenuOptions = contextMenu === true ? {} : contextMenu;
            const items = typeof contextMenuOptions.items === 'function'
              ? contextMenuOptions.items(item)
              : contextMenuOptions.items ?? defaultContextMenuItems;
            const handleContextMenuClick: NonNullable<MenuProps['onClick']> = (info) => {
              const emitClick = () => contextMenuOptions.onClick?.({ ...info, data: item });
              if (info.key === 'delete') {
                confirmDelete(deleteConfirm, emitClick);
              } else {
                void emitClick();
              }
            };

            return (
              <Dropdown
                key={itemKey}
                trigger={['contextMenu']}
                menu={{
                  items,
                  onClick: handleContextMenuClick,
                }}
              >
                {itemNode}
              </Dropdown>
            );
          })}
      </div>
    </div>
  );
}

export default ListPanel;

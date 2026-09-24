import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Empty,
  Input,
  Select,
  Spin,
  type SelectProps,
} from 'antd';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { GroupedSelectAddEditor } from './AddEditor';
import { GroupedSelectDeleteButton } from './DeleteButton';
import { GroupedSelectEditEditor } from './EditEditor';
import { GroupedSelectColorSwatch } from './ColorPickerSelect';
import type { ListDeleteConfirmOptions } from '../shared/listDeleteConfirm';
import {
  getVisibleGroupedSelectGroups,
  resolveGroupedSelectOptions,
  toggleGroupedSelectValue,
  type GroupedSelectGroup,
  type GroupedSelectColor,
  type GroupedSelectOption,
  type GroupedSelectValue,
} from './utils';
import './style.css';

const EMPTY_SELECTED_OPTIONS: GroupedSelectOption[] = [];

export interface GroupedSelectProps {
  groups: GroupedSelectGroup[];
  value?: GroupedSelectValue[];
  defaultValue?: GroupedSelectValue[];
  onChange?: (values: GroupedSelectValue[]) => void;
  /** 远程模式下，初始已选项未包含在 groups 时可用它提供标签文案。 */
  selectedOptions?: GroupedSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  /** 新增或编辑分组时允许输入的最大字符数；不传则不限制。 */
  groupLabelMaxLength?: number;
  /** 新增或编辑标签时允许输入的最大字符数；不传则不限制。 */
  optionLabelMaxLength?: number;
  /** 新增或编辑分组/标签时可选的颜色。 */
  colorOptions?: GroupedSelectColor[];
  /** 新增标签时默认选中的颜色；不影响已有标签。 */
  defaultColor?: string;
  /** remote 模式只展示传入的 groups，不再执行本地筛选。 */
  searchMode?: 'local' | 'remote';
  onSearchChange?: (keyword: string) => void;
  searchLoading?: boolean;
  /** 在下拉框内输入分组名并确认后调用。 */
  onAddGroup?: (label: string) => void | Promise<void>;
  /** 在下拉框内输入标签名并选择所属分组后调用。 */
  onAddOption?: (label: string, group: GroupedSelectGroup, color?: string) => void | Promise<void>;
  /** 编辑分组名称，保存时调用；返回 Promise 时等待完成。 */
  onEditGroup?: (group: GroupedSelectGroup, label: string) => void | Promise<void>;
  /** 远程模式下 groups 可能是部分结果，调用方还需清理该分组下的受控已选值。 */
  onDeleteGroup?: (group: GroupedSelectGroup) => void | Promise<void>;
  /** 编辑标签名称或所属分组，保存时调用；返回 Promise 时等待完成。 */
  onEditOption?: (
    option: GroupedSelectOption,
    group: GroupedSelectGroup,
    label: string,
    nextGroup: GroupedSelectGroup,
    color?: string,
  ) => void | Promise<void>;
  onDeleteOption?: (option: GroupedSelectOption, group: GroupedSelectGroup) => void | Promise<void>;
  deleteConfirm?: ListDeleteConfirmOptions;
  selectProps?: Omit<SelectProps<GroupedSelectValue[]>,
    | 'mode' | 'value' | 'defaultValue' | 'onChange' | 'options'
    | 'popupRender' | 'onOpenChange' | 'open' | 'showSearch' | 'filterOption'
  >;
  className?: string;
  style?: CSSProperties;
}

export function GroupedSelect({
  groups,
  value,
  defaultValue = [],
  onChange,
  selectedOptions = EMPTY_SELECTED_OPTIONS,
  placeholder = '请选择',
  searchPlaceholder = '请输入内容',
  groupLabelMaxLength,
  optionLabelMaxLength,
  colorOptions = [],
  defaultColor,
  searchMode = 'local',
  onSearchChange,
  searchLoading = false,
  onAddGroup,
  onAddOption,
  onEditGroup,
  onDeleteGroup,
  onEditOption,
  onDeleteOption,
  deleteConfirm,
  selectProps,
  className,
  style,
}: GroupedSelectProps) {
  const [innerValue, setInnerValue] = useState(defaultValue);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [addMode, setAddMode] = useState<'group' | 'option' | null>(null);
  const [draftLabel, setDraftLabel] = useState('');
  const [draftGroupId, setDraftGroupId] = useState<GroupedSelectValue | undefined>();
  const [draftColor, setDraftColor] = useState<string>();
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [editing, setEditing] = useState<{
    kind: 'group' | 'option';
    group: GroupedSelectGroup;
    option?: GroupedSelectOption;
  } | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<GroupedSelectValue>();
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState<string>();
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [cachedOptions, setCachedOptions] = useState(
    () => new Map<GroupedSelectValue, GroupedSelectOption>(),
  );
  const selected = value === undefined ? innerValue : value;
  const visibleGroups = getVisibleGroupedSelectGroups(groups, search, searchMode);
  const options = resolveGroupedSelectOptions(
    groups, selected, selectedOptions, cachedOptions,
  );
  const selectOptions = options.map((option) => ({
    value: option.value,
    label: <GroupedSelectColorSwatch color={option.color} label={option.label} />,
  }));

  useEffect(() => {
    const selectedValues = new Set(selected);
    // The cache is only for labels of selected values that may disappear from remote results.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCachedOptions((previous) => {
      const next = new Map(
        [...previous].filter(([key]) => selectedValues.has(key)),
      );
      selectedOptions.forEach((option) => {
        if (selectedValues.has(option.value) && !next.has(option.value)) {
          next.set(option.value, option);
        }
      });
      groups.forEach((group) => group.options.forEach((option) => {
        if (selectedValues.has(option.value)) next.set(option.value, option);
      }));
      if (next.size === previous.size && [...next].every(([key, option]) =>
        previous.get(key) === option)) return previous;
      return next;
    });
  }, [groups, selected, selectedOptions]);

  const updateSearch = (keyword: string) => {
    setSearch(keyword);
    onSearchChange?.(keyword);
  };

  const commit = (next: GroupedSelectValue[]) => {
    if (value === undefined) setInnerValue(next);
    onChange?.(next);
  };
  const beginEdit = (group: GroupedSelectGroup, option?: GroupedSelectOption) => {
    setAddMode(null);
    setEditing({ kind: option ? 'option' : 'group', group, option });
    setEditingGroupId(group.id);
    setEditLabel(option?.label ?? group.label);
    setEditColor(option?.color);
    setEditError('');
  };
  const submitEdit = async () => {
    const label = editLabel.trim();
    if (!editing || !label || editSaving) return;
    setEditSaving(true);
    setEditError('');
    try {
      if (editing.kind === 'group') await onEditGroup?.(editing.group, label);
      else if (editing.option) {
        const nextGroup = groups.find((group) => group.id === editingGroupId)
          ?? editing.group;
        await onEditOption?.(editing.option, editing.group, label, nextGroup, editColor);
      }
      setEditing(null);
      setEditingGroupId(undefined);
      if (searchMode === 'remote' && search) onSearchChange?.(search);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : '编辑失败，请重试');
    } finally {
      setEditSaving(false);
    }
  };
  const beginAdd = (mode: 'group' | 'option') => {
    setEditing(null);
    setEditingGroupId(undefined);
    setAddMode(mode);
    setDraftLabel('');
    setDraftGroupId(groups[0]?.id);
    setDraftColor(mode === 'option' ? defaultColor : undefined);
    setAddError('');
  };
  const submitAdd = async () => {
    const label = draftLabel.trim();
    if (!label || !addMode || adding) return;
    const group = groups.find((item) => item.id === draftGroupId);
    if (addMode === 'option' && !group) return;
    setAdding(true);
    setAddError('');
    try {
      if (addMode === 'group') await onAddGroup?.(label);
      else if (group) await onAddOption?.(label, group, draftColor);
      setAddMode(null);
      setDraftLabel('');
      setDraftColor(undefined);
      updateSearch('');
    } catch (error) {
      setAddError(error instanceof Error ? error.message : '新增失败，请重试');
    } finally {
      setAdding(false);
    }
  };
  const deleteGroup = async (group: GroupedSelectGroup) => {
    await onDeleteGroup?.(group);
    if (editing?.group.id === group.id) {
      setEditing(null);
      setEditingGroupId(undefined);
    }
    if (searchMode === 'local') {
      const removed = new Set(group.options.map((option) => option.value));
      const next = selected.filter((item) => !removed.has(item));
      if (next.length !== selected.length) commit(next);
    }
    if (searchMode === 'remote' && search) onSearchChange?.(search);
  };
  const deleteOption = async (option: GroupedSelectOption, group: GroupedSelectGroup) => {
    await onDeleteOption?.(option, group);
    if (editing?.option?.value === option.value) {
      setEditing(null);
      setEditingGroupId(undefined);
    }
    const next = selected.filter((item) => item !== option.value);
    if (next.length !== selected.length) commit(next);
    if (searchMode === 'remote' && search) onSearchChange?.(search);
  };

  return (
    <div className={`xc-grouped-select${className ? ` ${className}` : ''}`} style={style}>
      <Select<GroupedSelectValue[]>
        {...selectProps}
        className={`xc-grouped-select__trigger${selectProps?.className ? ` ${selectProps.className}` : ''}`}
        mode="multiple"
        value={selected}
        onChange={commit}
        options={selectOptions}
        placeholder={placeholder}
        showSearch={false}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            if (search) updateSearch('');
            setAddMode(null);
            setAddError('');
            setEditing(null);
            setEditingGroupId(undefined);
            setEditError('');
          }
        }}
        popupMatchSelectWidth
        popupRender={() => (
          <div className="xc-grouped-select__popup" onMouseDown={(event) => event.stopPropagation()}>
            <div className="xc-grouped-select__search">
              <Input
                allowClear
                aria-label="搜索分组选项"
                placeholder={searchPlaceholder}
                suffix={<SearchOutlined />}
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
              />
            </div>
            <div className="xc-grouped-select__list">
              {searchLoading ? (
                <div className="xc-grouped-select__loading" role="status">
                  <Spin size="small" /> 正在搜索...
                </div>
              ) : visibleGroups.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无匹配选项" />
              ) : visibleGroups.map((group) => (
                <section key={group.id} className="xc-grouped-select__group">
                  <div className="xc-grouped-select__row xc-grouped-select__group-row"
                    onMouseDown={editing?.kind === 'group' && editing.group.id === group.id
                      ? undefined : (event) => event.preventDefault()}>
                    {editing?.kind === 'group' && editing.group.id === group.id ? (
                      <GroupedSelectEditEditor
                        kind="group"
                        label={editLabel}
                        colorOptions={colorOptions}
                        color={editColor}
                        maxLength={groupLabelMaxLength}
                        saving={editSaving}
                        error={editError}
                        onChange={setEditLabel}
                        onColorChange={setEditColor}
                        onSave={() => void submitEdit()}
                        onCancel={() => {
                          setEditing(null);
                          setEditingGroupId(undefined);
                        }}
                      />
                    ) : (
                      <>
                        <span className="xc-grouped-select__label">
                          {group.label}
                        </span>
                        {onEditGroup && (
                          <Button type="text" size="small" aria-label={`编辑分组 ${group.label}`}
                            icon={<EditOutlined />} onClick={() => beginEdit(group)} />
                        )}
                        {onDeleteGroup && (
                          <GroupedSelectDeleteButton label={`分组 ${group.label}`}
                            confirm={deleteConfirm} onDelete={() => deleteGroup(group)} />
                        )}
                      </>
                    )}
                  </div>
                  {group.options.map((option) => (
                    <div key={option.value} className="xc-grouped-select__row xc-grouped-select__option-row"
                      onMouseDown={editing?.kind === 'option' && editing.option?.value === option.value
                        ? undefined : (event) => event.preventDefault()}>
                      {editing?.kind === 'option' && editing.option?.value === option.value ? (
                        <GroupedSelectEditEditor
                          kind="option"
                          groups={groups}
                          groupId={editingGroupId}
                          label={editLabel}
                          colorOptions={colorOptions}
                          color={editColor}
                          maxLength={optionLabelMaxLength}
                          saving={editSaving}
                          error={editError}
                          onChange={setEditLabel}
                          onColorChange={setEditColor}
                          onGroupChange={setEditingGroupId}
                          onSave={() => void submitEdit()}
                          onCancel={() => {
                            setEditing(null);
                            setEditingGroupId(undefined);
                          }}
                        />
                      ) : (
                        <>
                          <Checkbox
                            className="xc-grouped-select__label"
                            disabled={option.disabled}
                            checked={selected.includes(option.value)}
                            onChange={() => commit(toggleGroupedSelectValue(selected, option.value))}
                          >
                            <GroupedSelectColorSwatch color={option.color} label={option.label} />
                          </Checkbox>
                          {onEditOption && (
                            <Button type="text" size="small" aria-label={`编辑选项 ${option.label}`}
                              icon={<EditOutlined />} onClick={() => beginEdit(group, option)} />
                          )}
                          {onDeleteOption && (
                            <GroupedSelectDeleteButton label={`标签 ${option.label}`}
                              confirm={deleteConfirm} onDelete={() => deleteOption(option, group)} />
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </section>
              ))}
            </div>
            {(onAddGroup || onAddOption) && (
              <>
                {addMode && (
                  <GroupedSelectAddEditor
                    mode={addMode}
                    groups={groups}
                    label={draftLabel}
                    maxLength={addMode === 'group'
                      ? groupLabelMaxLength
                      : optionLabelMaxLength}
                    groupId={draftGroupId}
                    colorOptions={colorOptions}
                    color={draftColor}
                    adding={adding}
                    error={addError}
                    onLabelChange={setDraftLabel}
                    onGroupChange={setDraftGroupId}
                    onColorChange={setDraftColor}
                    onSubmit={() => void submitAdd()}
                    onCancel={() => setAddMode(null)}
                  />
                )}
                <div className="xc-grouped-select__footer">
                  {onAddGroup && <Button disabled={adding} onClick={() => beginAdd('group')}>添加分组</Button>}
                  {onAddOption && <Button disabled={adding || !groups.length}
                    onClick={() => beginAdd('option')}>添加标签</Button>}
                </div>
              </>
            )}
          </div>
        )}
      />
    </div>
  );
}

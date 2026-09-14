import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Empty,
  Input,
  Select,
  type SelectProps,
} from 'antd';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { GroupedSelectAddEditor } from './AddEditor';
import { GroupedSelectDeleteButton } from './DeleteButton';
import { GroupedSelectEditEditor } from './EditEditor';
import type { ListDeleteConfirmOptions } from '../shared/listDeleteConfirm';
import {
  filterGroupedSelectGroups,
  toggleGroupedSelectValue,
  type GroupedSelectGroup,
  type GroupedSelectOption,
  type GroupedSelectValue,
} from './utils';
import './style.css';

export interface GroupedSelectProps {
  groups: GroupedSelectGroup[];
  value?: GroupedSelectValue[];
  defaultValue?: GroupedSelectValue[];
  onChange?: (values: GroupedSelectValue[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  /** 在下拉框内输入分组名并确认后调用。 */
  onAddGroup?: (label: string) => void | Promise<void>;
  /** 在下拉框内输入标签名并选择所属分组后调用。 */
  onAddOption?: (label: string, group: GroupedSelectGroup) => void | Promise<void>;
  /** 编辑分组名称，保存时调用；返回 Promise 时等待完成。 */
  onEditGroup?: (group: GroupedSelectGroup, label: string) => void | Promise<void>;
  onDeleteGroup?: (group: GroupedSelectGroup) => void | Promise<void>;
  /** 编辑标签名称，保存时调用；返回 Promise 时等待完成。 */
  onEditOption?: (option: GroupedSelectOption, group: GroupedSelectGroup, label: string) => void | Promise<void>;
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
  placeholder = '请选择',
  searchPlaceholder = '请输入内容',
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
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [editing, setEditing] = useState<{
    kind: 'group' | 'option';
    group: GroupedSelectGroup;
    option?: GroupedSelectOption;
  } | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const selected = value === undefined ? innerValue : value;
  const visibleGroups = filterGroupedSelectGroups(groups, search);
  const options = groups.flatMap((group) => group.options.map((option) => ({
    value: option.value,
    label: option.label,
    disabled: option.disabled,
  })));

  const commit = (next: GroupedSelectValue[]) => {
    if (value === undefined) setInnerValue(next);
    onChange?.(next);
  };
  const beginEdit = (group: GroupedSelectGroup, option?: GroupedSelectOption) => {
    setAddMode(null);
    setEditing({ kind: option ? 'option' : 'group', group, option });
    setEditLabel(option?.label ?? group.label);
    setEditError('');
  };
  const submitEdit = async () => {
    const label = editLabel.trim();
    if (!editing || !label || editSaving) return;
    setEditSaving(true);
    setEditError('');
    try {
      if (editing.kind === 'group') await onEditGroup?.(editing.group, label);
      else if (editing.option) await onEditOption?.(editing.option, editing.group, label);
      setEditing(null);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : '编辑失败，请重试');
    } finally {
      setEditSaving(false);
    }
  };
  const beginAdd = (mode: 'group' | 'option') => {
    setEditing(null);
    setAddMode(mode);
    setDraftLabel('');
    setDraftGroupId(groups[0]?.id);
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
      else if (group) await onAddOption?.(label, group);
      setAddMode(null);
      setDraftLabel('');
      setSearch('');
    } catch (error) {
      setAddError(error instanceof Error ? error.message : '新增失败，请重试');
    } finally {
      setAdding(false);
    }
  };
  const deleteGroup = async (group: GroupedSelectGroup) => {
    await onDeleteGroup?.(group);
    if (editing?.group.id === group.id) setEditing(null);
    const removed = new Set(group.options.map((option) => option.value));
    const next = selected.filter((item) => !removed.has(item));
    if (next.length !== selected.length) commit(next);
  };
  const deleteOption = async (option: GroupedSelectOption, group: GroupedSelectGroup) => {
    await onDeleteOption?.(option, group);
    if (editing?.option?.value === option.value) setEditing(null);
    const next = selected.filter((item) => item !== option.value);
    if (next.length !== selected.length) commit(next);
  };

  return (
    <div className={`xc-grouped-select${className ? ` ${className}` : ''}`} style={style}>
      <Select<GroupedSelectValue[]>
        {...selectProps}
        className={`xc-grouped-select__trigger${selectProps?.className ? ` ${selectProps.className}` : ''}`}
        mode="multiple"
        value={selected}
        onChange={commit}
        options={options}
        placeholder={placeholder}
        showSearch={false}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setSearch('');
            setAddMode(null);
            setAddError('');
            setEditing(null);
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
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="xc-grouped-select__list">
              {visibleGroups.length === 0 ? (
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
                        saving={editSaving}
                        error={editError}
                        onChange={setEditLabel}
                        onSave={() => void submitEdit()}
                        onCancel={() => setEditing(null)}
                      />
                    ) : (
                      <>
                        <span className="xc-grouped-select__label">{group.label}</span>
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
                          label={editLabel}
                          saving={editSaving}
                          error={editError}
                          onChange={setEditLabel}
                          onSave={() => void submitEdit()}
                          onCancel={() => setEditing(null)}
                        />
                      ) : (
                        <>
                          <Checkbox
                            className="xc-grouped-select__label"
                            disabled={option.disabled}
                            checked={selected.includes(option.value)}
                            onChange={() => commit(toggleGroupedSelectValue(selected, option.value))}
                          >
                            {option.label}
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
                    groupId={draftGroupId}
                    adding={adding}
                    error={addError}
                    onLabelChange={setDraftLabel}
                    onGroupChange={setDraftGroupId}
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

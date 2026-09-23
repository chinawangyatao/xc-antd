import { describe, expect, test } from 'bun:test';
import { Children, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GroupedSelect } from '../src/GroupedSelect';
import { GroupedSelectAddEditor } from '../src/GroupedSelect/AddEditor';
import { GroupedSelectDeleteButton } from '../src/GroupedSelect/DeleteButton';
import { GroupedSelectEditEditor } from '../src/GroupedSelect/EditEditor';
import { GroupedSelectColorPicker } from '../src/GroupedSelect/ColorPickerSelect';
import {
  filterGroupedSelectGroups,
  getVisibleGroupedSelectGroups,
  resolveGroupedSelectOptions,
  toggleGroupedSelectValue,
  type GroupedSelectGroup,
} from '../src/GroupedSelect/utils';

const groups: GroupedSelectGroup[] = [
  { id: 'a', label: '分组A', options: [
    { value: 'a-1', label: '选项A-1' },
    { value: 'a-2', label: '选项A-2' },
  ] },
  { id: 'b', label: '分组B', options: [{ value: 'b-1', label: '选项B-1' }] },
];

describe('GroupedSelect', () => {
  test('keeps complete groups when searching their names and narrows option matches', () => {
    expect(filterGroupedSelectGroups(groups, ' 分组A ')).toEqual([groups[0]]);
    expect(filterGroupedSelectGroups(groups, 'a-2')).toEqual([
      { ...groups[0], options: [groups[0].options[1]] },
    ]);
    expect(filterGroupedSelectGroups(groups, 'missing')).toEqual([]);
    expect(filterGroupedSelectGroups(groups, ' ')).toBe(groups);
  });

  test('uses server groups directly and retains labels when a selected option leaves the results', () => {
    expect(getVisibleGroupedSelectGroups(groups, 'a-2', 'remote')).toBe(groups);
    expect(getVisibleGroupedSelectGroups(groups, 'a-2', 'local')).toEqual([
      { ...groups[0], options: [groups[0].options[1]] },
    ]);
    const cached = new Map([['a-1', groups[0].options[0]]]);
    expect(resolveGroupedSelectOptions([groups[1]], ['a-1'], [], cached)).toEqual([
      ...groups[1].options,
      groups[0].options[0],
    ]);
    expect(resolveGroupedSelectOptions([], ['a-2'], [groups[0].options[1]], new Map()))
      .toEqual([groups[0].options[1]]);
    const renamed = { ...groups[0].options[0], label: '接口更新后的名称' };
    expect(resolveGroupedSelectOptions(
      [], ['a-1'], [groups[0].options[0]], new Map([['a-1', renamed]]),
    )).toEqual([renamed]);
  });

  test('toggles checkbox selection without changing its source array', () => {
    const selected = ['a-1'];
    expect(toggleGroupedSelectValue(selected, 'a-2')).toEqual(['a-1', 'a-2']);
    expect(toggleGroupedSelectValue(selected, 'a-1')).toEqual([]);
    expect(selected).toEqual(['a-1']);
  });

  test('renders a multiple Select with a placeholder', () => {
    const html = renderToStaticMarkup(<GroupedSelect groups={groups} />);
    expect(html).toContain('xc-grouped-select__trigger');
    expect(html).toContain('请选择');
    const selected = renderToStaticMarkup(
      <GroupedSelect groups={groups} value={['a-1']} />,
    );
    expect(selected).toContain('选项A-1');
    const remoteSelected = renderToStaticMarkup(
      <GroupedSelect
        groups={[]}
        searchMode="remote"
        value={['a-1']}
        selectedOptions={[groups[0].options[0]]}
      />,
    );
    expect(remoteSelected).toContain('选项A-1');
  });

  test('renders both addition forms inside the Select popup', () => {
    const props = {
      groups,
      label: '',
      adding: false,
      error: '',
      onLabelChange: () => undefined,
      onGroupChange: () => undefined,
      onSubmit: () => undefined,
      onCancel: () => undefined,
    };
    const unlimitedGroupHtml = renderToStaticMarkup(
      <GroupedSelectAddEditor {...props} mode="group" />,
    );
    const groupHtml = renderToStaticMarkup(
      <GroupedSelectAddEditor {...props} mode="group" maxLength={4} />,
    );
    const optionHtml = renderToStaticMarkup(
      <GroupedSelectAddEditor {...props} mode="option" groupId="a" maxLength={6} />,
    );
    expect(groupHtml).toContain('新分组名称');
    expect(groupHtml).not.toContain('所属分组');
    expect(unlimitedGroupHtml).not.toContain('maxLength=');
    expect(groupHtml).toContain('maxLength="4"');
    expect(optionHtml).toContain('新标签名称');
    expect(optionHtml).toContain('所属分组');
    expect(optionHtml).toContain('maxLength="6"');
    expect(optionHtml).toContain('xc-grouped-select__editor');
  });

  test('renders inline group and option editing controls', () => {
    const props = {
      label: '新名称',
      saving: false,
      error: '',
      groups,
      groupId: 'a',
      onChange: () => undefined,
      onGroupChange: () => undefined,
      onSave: () => undefined,
      onCancel: () => undefined,
    };
    const groupEditor = GroupedSelectEditEditor({ ...props, kind: 'group', maxLength: 4 });
    const optionEditor = GroupedSelectEditEditor({ ...props, kind: 'option', maxLength: 8 });
    const groupChildren = Children.toArray(groupEditor.props.children) as ReactElement<Record<string, unknown>>[];
    const optionChildren = Children.toArray(optionEditor.props.children) as ReactElement<Record<string, unknown>>[];
    expect(groupEditor.props.className).toBe('xc-grouped-select__inline-editor');
    expect(groupChildren[0].props['aria-label']).toBe('编辑分组名称');
    expect(groupChildren[0].props.maxLength).toBe(4);
    expect(optionChildren[0].props['aria-label']).toBe('所属分组');
    expect(optionChildren[0].props.value).toBe('a');
    expect(optionChildren[1].props['aria-label']).toBe('编辑标签名称');
    expect(optionChildren[1].props.maxLength).toBe(8);
    expect(optionChildren[2].props['aria-label']).toBe('保存编辑');
    expect(optionChildren[3].props['aria-label']).toBe('取消编辑');
  });

  test('renders delete actions with an optional confirmation bubble', () => {
    const confirmed = GroupedSelectDeleteButton({ label: '标签 A', onDelete: () => undefined });
    const direct = GroupedSelectDeleteButton({
      label: '标签 A', confirm: false, onDelete: () => undefined,
    });
    expect(confirmed.props.title).toBe('确认删除标签 A吗？');
    expect(confirmed.props.children.props['aria-label']).toBe('删除标签 A');
    expect(direct.props['aria-label']).toBe('删除标签 A');
  });

  test('renders the externally supplied color picker in add and edit flows', () => {
    const colors = ['#1677ff', '#52c41a', '#faad14'];
    const pickerHtml = renderToStaticMarkup(
      <GroupedSelectColorPicker
        colors={colors}
        value="#52c41a"
        onChange={() => undefined}
      />,
    );
    expect(pickerHtml).toContain('选择颜色');
    expect(pickerHtml).toContain('ant-color-picker-trigger');
    expect(pickerHtml).toContain('rgb(82,196,26)');
    expect(pickerHtml).toContain('xc-grouped-select__color-picker');
    expect(pickerHtml).toContain('xc-grouped-select__color-picker-root');

    const addHtml = renderToStaticMarkup(
      <GroupedSelectAddEditor
        mode="option"
        groups={groups}
        label="新标签"
        colorOptions={colors}
        color="#1677ff"
        groupId="a"
        adding={false}
        error=""
        onLabelChange={() => undefined}
        onGroupChange={() => undefined}
        onColorChange={() => undefined}
        onSubmit={() => undefined}
        onCancel={() => undefined}
      />,
    );
    expect(addHtml).toContain('ant-color-picker-trigger');
  });
});

import { useState } from 'react';
import { Alert, Card, Space, Typography } from 'antd';
import {
  GroupedSelect,
  type GroupedSelectGroup,
  type GroupedSelectValue,
} from '@zhilv/xc-antd';

const initialGroups: GroupedSelectGroup[] = [
  {
    id: 'group-a', label: '分组A', options: [
      { value: 'a-1', label: '选项A-1' },
      { value: 'a-2', label: '选项A-2' },
      { value: 'a-3', label: '选项A-3' },
    ],
  },
  { id: 'group-b', label: '分组B', options: [{ value: 'b-1', label: '选项B-1' }] },
];

export default function GroupedSelectDemo() {
  const [groups, setGroups] = useState(initialGroups);
  const [value, setValue] = useState<GroupedSelectValue[]>([]);

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Typography.Title level={3} style={{ marginTop: 0 }}>GroupedSelect 分组选择</Typography.Title>
        <Typography.Paragraph type="secondary">
          对照原型：搜索、多选、新增、行内编辑和气泡确认删除都在下拉框内完成。数据仅保存在本页。
        </Typography.Paragraph>
      </div>
      <Card title="可编辑的分组选择" style={{ maxWidth: 600 }}>
        <GroupedSelect
          groups={groups}
          value={value}
          onChange={setValue}
          onAddGroup={(nextLabel) => {
            setGroups((current) => [...current, {
              id: `group-${crypto.randomUUID()}`,
              label: nextLabel,
              options: [],
            }]);
          }}
          onAddOption={(nextLabel, group) => {
            setGroups((current) => current.map((item) => item.id === group.id
              ? { ...item, options: [...item.options, {
                value: `option-${crypto.randomUUID()}`,
                label: nextLabel,
              }] }
              : item));
          }}
          onEditGroup={(target, nextLabel) => {
            setGroups((current) => current.map((group) => group.id === target.id
              ? { ...group, label: nextLabel } : group));
          }}
          onEditOption={(target, group, nextLabel) => {
            setGroups((current) => current.map((item) => item.id === group.id
              ? { ...item, options: item.options.map((option) => option.value === target.value
                ? { ...option, label: nextLabel } : option) }
              : item));
          }}
          onDeleteGroup={(target) => {
            setGroups((current) => current.filter((group) => group.id !== target.id));
          }}
          onDeleteOption={(target, group) => {
            setGroups((current) => current.map((item) => item.id === group.id
              ? { ...item, options: item.options.filter((option) => option.value !== target.value) }
              : item));
          }}
        />
        <Alert style={{ marginTop: 20 }} type="info"
          message={`当前选中：${value.length ? value.join('、') : '暂无'}`} />
      </Card>
    </Space>
  );
}

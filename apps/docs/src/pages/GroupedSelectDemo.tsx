import { useEffect, useState } from 'react';
import { Alert, Card, Space, Typography } from 'antd';
import {
  GroupedSelect,
  type GroupedSelectGroup,
  type GroupedSelectOption,
  type GroupedSelectValue,
} from 'xc-antd';

const initialGroups: GroupedSelectGroup[] = [
  {
    id: 'group-a', label: '分组A', options: [
      { value: 'a-1', label: '选项A-1', color: '#1677ff' },
      { value: 'a-2', label: '选项A-2', color: '#52c41a' },
      { value: 'a-3', label: '选项A-3', color: '#faad14' },
    ],
  },
  { id: 'group-b', label: '分组B', options: [{ value: 'b-1', label: '选项B-1', color: '#722ed1' }] },
];

const colorOptions = [
  '#ffffff', '#000000', '#8c8c8c', '#1677ff', '#13c2c2', '#52c41a', '#f5222d', '#fa8c16',
  '#fadb14', '#722ed1', '#d9d9d9', '#595959', '#bfbfbf', '#91caff', '#87e8de', '#95de64',
  '#ffccc7', '#ffd591', '#fff1b8', '#d3adf7', '#ff7875', '#ffc069', '#ffe58f', '#b37feb',
  '#ff4d4f', '#ffa940', '#fadb14', '#9254de', '#cf1322', '#d46b08', '#d48806', '#531dab',
];

const initialSelectedOption = initialGroups[0].options[0];
const initialSelectedOptions = [initialSelectedOption];

function mockSearchGroups(
  keyword: string,
  catalog: GroupedSelectGroup[],
  signal: AbortSignal,
) {
  return new Promise<GroupedSelectGroup[]>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      const query = keyword.trim().toLocaleLowerCase();
      resolve(catalog.flatMap((group) => {
        if (!query || group.label.toLocaleLowerCase().includes(query)) return [group];
        const options = group.options.filter((option) =>
          option.label.toLocaleLowerCase().includes(query));
        return options.length ? [{ ...group, options }] : [];
      }));
    }, 320);
    signal.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('请求已取消', 'AbortError'));
    }, { once: true });
  });
}

function mockCreateGroup(label: string) {
  return new Promise<GroupedSelectGroup>((resolve) => {
    window.setTimeout(() => resolve({
      id: `group-${crypto.randomUUID()}`,
      label,
      options: [],
    }), 320);
  });
}

function mockCreateOption(label: string) {
  return new Promise<GroupedSelectOption>((resolve) => {
    window.setTimeout(() => resolve({
      value: `option-${crypto.randomUUID()}`,
      label,
    }), 320);
  });
}

export default function GroupedSelectDemo() {
  const [groups, setGroups] = useState(initialGroups);
  const [value, setValue] = useState<GroupedSelectValue[]>([]);
  const [readOnlyValue, setReadOnlyValue] = useState<GroupedSelectValue[]>(['a-1']);
  const [remoteCatalog, setRemoteCatalog] = useState(initialGroups);
  const [remoteGroups, setRemoteGroups] = useState(initialGroups);
  const [remoteValue, setRemoteValue] = useState<GroupedSelectValue[]>([
    initialSelectedOption.value,
  ]);
  const [remoteQuery, setRemoteQuery] = useState('');
  const [remoteLoading, setRemoteLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const debounce = window.setTimeout(() => {
      void mockSearchGroups(remoteQuery, remoteCatalog, controller.signal)
        .then(setRemoteGroups)
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            console.error('模拟远程搜索失败', error);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setRemoteLoading(false);
        });
    }, 250);
    return () => {
      window.clearTimeout(debounce);
      controller.abort();
    };
  }, [remoteCatalog, remoteQuery]);

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Typography.Title level={3} style={{ marginTop: 0 }}>GroupedSelect 分组选择</Typography.Title>
        <Typography.Paragraph type="secondary">
          对照原型：搜索、多选、新增、行内编辑（支持切换标签所属分组）和气泡确认删除都在下拉框内完成。数据仅保存在本页。
        </Typography.Paragraph>
      </div>
      <Card title="可编辑的分组选择" style={{ maxWidth: 600 }}>
        <GroupedSelect
          groups={groups}
          value={value}
          onChange={setValue}
          groupLabelMaxLength={12}
          optionLabelMaxLength={20}
          colorOptions={colorOptions}
          onAddGroup={(nextLabel) => {
            setGroups((current) => [...current, {
              id: `group-${crypto.randomUUID()}`,
              label: nextLabel,
              options: [],
            }]);
          }}
          onAddOption={(nextLabel, group, color) => {
            setGroups((current) => current.map((item) => item.id === group.id
              ? { ...item, options: [...item.options, {
                value: `option-${crypto.randomUUID()}`,
                label: nextLabel,
                color,
              }] }
              : item));
          }}
          onEditGroup={(target, nextLabel) => {
            setGroups((current) => current.map((group) => group.id === target.id
              ? { ...group, label: nextLabel } : group));
          }}
          onEditOption={(target, group, nextLabel, nextGroup, color) => {
            setGroups((current) => {
              const renamed = { ...target, label: nextLabel, color };
              if (group.id === nextGroup.id) {
                return current.map((item) => item.id === group.id
                  ? { ...item, options: item.options.map((option) => option.value === target.value
                    ? renamed : option) }
                  : item);
              }
              return current.map((item) => {
                if (item.id === group.id) {
                  return {
                    ...item,
                    options: item.options.filter((option) => option.value !== target.value),
                  };
                }
                if (item.id === nextGroup.id) {
                  return {
                    ...item,
                    options: [
                      ...item.options.filter((option) => option.value !== target.value),
                      renamed,
                    ],
                  };
                }
                return item;
              });
            });
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
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          点击“添加标签”或选项右侧的编辑按钮，再点击颜色按钮即可从预设色板选择颜色；选中的颜色会显示在标签名称旁。
        </Typography.Paragraph>
        <Alert style={{ marginTop: 20 }} type="info"
          message={`当前选中：${value.length ? value.join('、') : '暂无'}`} />
      </Card>
      <Card title="非编辑模式（不启用颜色选择）" style={{ maxWidth: 600 }}>
        <Typography.Paragraph type="secondary">
          不传 colorOptions 时不会显示颜色选择器；本示例只保留搜索和多选能力，也不传新增、编辑、删除回调。
        </Typography.Paragraph>
        <GroupedSelect
          groups={initialGroups}
          value={readOnlyValue}
          onChange={setReadOnlyValue}
          placeholder="请选择标签"
        />
        <Alert
          style={{ marginTop: 20 }}
          type="info"
          message={`当前选中：${readOnlyValue.length ? readOnlyValue.join('、') : '暂无'}`}
        />
      </Card>
      <Card title="远程搜索（模拟接口）" style={{ maxWidth: 600 }}>
        <Typography.Paragraph type="secondary">
          搜索请求延迟 320ms，输入防抖 250ms；连续输入会取消过期请求。可以在下拉框中异步添加分组、标签，然后再次搜索新内容；已选的 A-1 跨搜索结果仍会显示名称。
        </Typography.Paragraph>
        <GroupedSelect
          groups={remoteGroups}
          value={remoteValue}
          onChange={setRemoteValue}
          selectedOptions={initialSelectedOptions}
          searchMode="remote"
          searchLoading={remoteLoading}
          onSearchChange={(keyword) => {
            setRemoteLoading(true);
            setRemoteQuery(keyword);
          }}
          onAddGroup={async (label) => {
            const saved = await mockCreateGroup(label);
            setRemoteCatalog((current) => [...current, saved]);
          }}
          onAddOption={async (label, group) => {
            const saved = await mockCreateOption(label);
            setRemoteCatalog((current) => current.map((item) => item.id === group.id
              ? { ...item, options: [...item.options, saved] }
              : item));
          }}
        />
        <Alert style={{ marginTop: 20 }} type="info"
          message={`远程结果：${remoteGroups.length} 组；已选 ${remoteValue.length} 项`} />
      </Card>
    </Space>
  );
}

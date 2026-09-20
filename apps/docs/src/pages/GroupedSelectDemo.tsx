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
      { value: 'a-1', label: '选项A-1' },
      { value: 'a-2', label: '选项A-2' },
      { value: 'a-3', label: '选项A-3' },
    ],
  },
  { id: 'group-b', label: '分组B', options: [{ value: 'b-1', label: '选项B-1' }] },
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
          onEditOption={(target, group, nextLabel, nextGroup) => {
            setGroups((current) => {
              const renamed = { ...target, label: nextLabel };
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
        <Alert style={{ marginTop: 20 }} type="info"
          message={`当前选中：${value.length ? value.join('、') : '暂无'}`} />
      </Card>
      <Card title="非编辑模式" style={{ maxWidth: 600 }}>
        <Typography.Paragraph type="secondary">
          只保留搜索和多选能力；不传新增、编辑、删除回调，因此下拉框内不会显示任何编辑操作。
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

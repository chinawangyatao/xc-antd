import {
  Button,
  Dropdown,
  Input,
  Popover,
  Tooltip,
  type MenuProps,
} from 'antd';
import {
  ColumnHeightOutlined,
  FilterFilled,
  FilterOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { HocTableColumnSettings } from './ColumnSettings';
import type { HocTableOptions } from './types';
import type { HocTableColumnSetting } from './utils';

export interface HocTableToolbarProps {
  addText: React.ReactNode;
  onAdd?: () => void;
  extra?: React.ReactNode;
  globalSearch: string;
  onGlobalSearchChange: (value: string) => void;
  filterVisible: boolean;
  onFilterVisibleChange: (visible: boolean) => void;
  size: 'large' | 'middle' | 'small';
  onSizeChange: (size: 'large' | 'middle' | 'small') => void;
  columnSettings: HocTableColumnSetting[];
  onColumnSettingsChange: (settings: HocTableColumnSetting[]) => void;
  onColumnSettingsReset: () => void;
  options: Required<HocTableOptions>;
}

const densityItems: MenuProps['items'] = [
  { key: 'large', label: '宽松' },
  { key: 'middle', label: '中等' },
  { key: 'small', label: '紧凑' },
];

export function HocTableToolbar({
  addText,
  onAdd,
  extra,
  globalSearch,
  onGlobalSearchChange,
  filterVisible,
  onFilterVisibleChange,
  size,
  onSizeChange,
  columnSettings,
  onColumnSettingsChange,
  onColumnSettingsReset,
  options,
}: HocTableToolbarProps) {
  return (
    <div className="xc-hoc-table__toolbar">
      <div className="xc-hoc-table__toolbar-primary">
        {onAdd && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
            {addText}
          </Button>
        )}
        {extra}
      </div>
      <div className="xc-hoc-table__toolbar-options">
        {options.search && (
          <Input.Search
            allowClear
            className="xc-hoc-table__global-search"
            placeholder="搜索表格内容"
            value={globalSearch}
            onChange={(event) => onGlobalSearchChange(event.target.value)}
          />
        )}
        {options.filter && (
          <Tooltip title={filterVisible ? '收起列筛选' : '展开列筛选'}>
            <Button
              aria-label={filterVisible ? '收起列筛选' : '展开列筛选'}
              type={filterVisible ? 'primary' : 'default'}
              icon={filterVisible ? <FilterFilled /> : <FilterOutlined />}
              onClick={() => onFilterVisibleChange(!filterVisible)}
            />
          </Tooltip>
        )}
        {options.density && (
          <Dropdown
            trigger={['click']}
            menu={{
              items: densityItems,
              selectable: true,
              selectedKeys: [size],
              onClick: ({ key }) => onSizeChange(key as typeof size),
            }}
          >
            <Tooltip title="表格密度">
              <Button aria-label="表格密度" icon={<ColumnHeightOutlined />} />
            </Tooltip>
          </Dropdown>
        )}
        {options.setting && (
          <Popover
            trigger="click"
            placement="bottomRight"
            content={(
              <HocTableColumnSettings
                columns={columnSettings}
                onChange={onColumnSettingsChange}
                onReset={onColumnSettingsReset}
              />
            )}
          >
            <Tooltip title="自定义列">
              <Button aria-label="自定义列" icon={<SettingOutlined />} />
            </Tooltip>
          </Popover>
        )}
      </div>
    </div>
  );
}

export default HocTableToolbar;

import { DatePicker, Input, Select, Switch } from 'antd';
import dayjs from 'dayjs';
import type {
  HocTableFilterMode,
  HocTableFilterOption,
} from './types';

interface BaseTableFilterProps {
  title: string;
  visible?: boolean;
  placeholder?: string;
}

export interface TableFilterInputProps extends BaseTableFilterProps {
  value?: string;
  onChange?: (value: string) => void;
  /** @deprecated 请使用 value。 */
  searchText?: string;
  /** @deprecated 请使用 onChange。 */
  onSearchChange?: (value: string) => void;
}

export interface TableFilterSelectProps extends BaseTableFilterProps {
  value?: string;
  onChange?: (value: string) => void;
  filterOptions?: HocTableFilterOption[];
  /** @deprecated 请使用 value。 */
  selectedValue?: string;
  /** @deprecated 请使用 onChange。 */
  onSelectedChange?: (value: string) => void;
}

export interface TableFilterDateProps extends BaseTableFilterProps {
  value?: string;
  onChange?: (value: string) => void;
  /** @deprecated 请使用 value。 */
  selectedDate?: string;
  /** @deprecated 请使用 onChange。 */
  onDateChange?: (value: string) => void;
}

export interface TableFilterSwitchProps extends BaseTableFilterProps {
  value?: string;
  onChange?: (value: string) => void;
  switchValue?: string | number | boolean;
  /** @deprecated 请使用 value。 */
  switchChecked?: boolean;
  /** @deprecated 请使用 onChange。 */
  onSwitchChange?: (value: string) => void;
}

export interface TableFilterProps
  extends TableFilterInputProps,
  TableFilterSelectProps,
  TableFilterDateProps,
  TableFilterSwitchProps {
  filterMode?: HocTableFilterMode;
}

function FilterFrame({
  title,
  visible,
  children,
}: {
  title: string;
  visible?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="xc-hoc-table__filter">
      <span>{title}</span>
      {visible && <div className="xc-hoc-table__filter-control">{children}</div>}
    </div>
  );
}

export function TableFilterInput(props: TableFilterInputProps) {
  const value = props.value ?? props.searchText;
  const onChange = (nextValue: string) => {
    props.onChange?.(nextValue);
    props.onSearchChange?.(nextValue);
  };
  return (
    <FilterFrame title={props.title} visible={props.visible}>
      <Input
        allowClear
        size="small"
        placeholder={props.placeholder ?? `请输入${props.title}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </FilterFrame>
  );
}

export function TableFilterSelect(props: TableFilterSelectProps) {
  const value = props.value ?? props.selectedValue;
  const onChange = (nextValue: string) => {
    props.onChange?.(nextValue);
    props.onSelectedChange?.(nextValue);
  };
  return (
    <FilterFrame title={props.title} visible={props.visible}>
      <Select
        allowClear
        size="small"
        placeholder={props.placeholder ?? `请选择${props.title}`}
        value={value || undefined}
        options={props.filterOptions}
        onChange={(nextValue) => onChange(nextValue == null ? '' : String(nextValue))}
      />
    </FilterFrame>
  );
}

export function TableFilterDate(props: TableFilterDateProps) {
  const value = props.value ?? props.selectedDate;
  const onChange = (nextValue: string) => {
    props.onChange?.(nextValue);
    props.onDateChange?.(nextValue);
  };
  return (
    <FilterFrame title={props.title} visible={props.visible}>
      <DatePicker
        allowClear
        size="small"
        placeholder={props.placeholder ?? `请选择${props.title}`}
        value={value ? dayjs(value) : null}
        onChange={(nextValue) => onChange(nextValue?.format('YYYY-MM-DD') ?? '')}
      />
    </FilterFrame>
  );
}

export function TableFilterSwitch(props: TableFilterSwitchProps) {
  const switchValue = String(props.switchValue ?? '1');
  const checked = props.value !== undefined
    ? props.value === switchValue
    : props.switchChecked ?? false;
  const onChange = (nextValue: string) => {
    props.onChange?.(nextValue);
    props.onSwitchChange?.(nextValue);
  };
  return (
    <FilterFrame title={props.title} visible={props.visible}>
      <Switch
        size="small"
        checkedChildren="是"
        unCheckedChildren="否"
        checked={checked}
        onChange={(nextChecked) => onChange(nextChecked ? switchValue : '')}
      />
    </FilterFrame>
  );
}

export function TableFilter(props: TableFilterProps) {
  if (props.filterMode === 'select') return <TableFilterSelect {...props} />;
  if (props.filterMode === 'date') return <TableFilterDate {...props} />;
  if (props.filterMode === 'switch') return <TableFilterSwitch {...props} />;
  return <TableFilterInput {...props} />;
}

TableFilter.Input = TableFilterInput;
TableFilter.Select = TableFilterSelect;
TableFilter.Date = TableFilterDate;
TableFilter.Switch = TableFilterSwitch;

export default TableFilter;

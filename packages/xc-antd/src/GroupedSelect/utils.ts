export type GroupedSelectValue = string | number;

export interface GroupedSelectColorOption {
  value: string;
  label?: string;
}

export type GroupedSelectColor = string | GroupedSelectColorOption;

export interface GroupedSelectOption {
  value: GroupedSelectValue;
  label: string;
  color?: string;
  disabled?: boolean;
}

export interface GroupedSelectGroup {
  id: GroupedSelectValue;
  label: string;
  options: GroupedSelectOption[];
}

export type GroupedSelectColorFilter = (
  option: GroupedSelectOption,
  selectedColor: string,
  group: GroupedSelectGroup,
) => boolean;

const defaultColorFilter: GroupedSelectColorFilter = (option, selectedColor) =>
  option.color?.toLowerCase() === selectedColor.toLowerCase();

export function getVisibleGroupedSelectGroups(
  groups: GroupedSelectGroup[],
  search: string,
  mode: 'local' | 'remote',
  selectedColor?: string,
  colorFilter: GroupedSelectColorFilter = defaultColorFilter,
) {
  const searchedGroups = mode === 'remote' ? groups : filterGroupedSelectGroups(groups, search);
  if (!selectedColor) return searchedGroups;
  return searchedGroups.flatMap((group) => {
    const options = group.options.filter((option) => colorFilter(option, selectedColor, group));
    return options.length ? [{ ...group, options }] : [];
  });
}

/** 保留远程结果之外的已选项标签；当前结果中的标签始终优先。 */
export function resolveGroupedSelectOptions(
  groups: GroupedSelectGroup[],
  selected: GroupedSelectValue[],
  selectedOptions: GroupedSelectOption[],
  cachedOptions: ReadonlyMap<GroupedSelectValue, GroupedSelectOption>,
): GroupedSelectOption[] {
  const options = groups.flatMap((group) => group.options);
  const currentValues = new Set(options.map((option) => option.value));
  const known = new Map<GroupedSelectValue, GroupedSelectOption>();
  selectedOptions.forEach((option) => known.set(option.value, option));
  cachedOptions.forEach((option, value) => known.set(value, option));
  options.forEach((option) => known.set(option.value, option));

  return [
    ...options,
    ...selected.filter((value) => !currentValues.has(value)).map((value) =>
      known.get(value) ?? { value, label: String(value) }),
  ];
}

export function filterGroupedSelectGroups(groups: GroupedSelectGroup[], search: string) {
  const keyword = search.trim().toLocaleLowerCase();
  if (!keyword) return groups;
  return groups.flatMap((group) => {
    if (group.label.toLocaleLowerCase().includes(keyword)) return [group];
    const options = group.options.filter((option) =>
      option.label.toLocaleLowerCase().includes(keyword));
    return options.length ? [{ ...group, options }] : [];
  });
}

export function toggleGroupedSelectValue(
  values: GroupedSelectValue[],
  value: GroupedSelectValue,
): GroupedSelectValue[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

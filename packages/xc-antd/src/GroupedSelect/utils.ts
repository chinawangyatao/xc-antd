export type GroupedSelectValue = string | number;

export interface GroupedSelectOption {
  value: GroupedSelectValue;
  label: string;
  disabled?: boolean;
}

export interface GroupedSelectGroup {
  id: GroupedSelectValue;
  label: string;
  options: GroupedSelectOption[];
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

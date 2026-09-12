export interface ListToolbarVisibilityOptions {
  searchable: boolean;
  showSearchInput?: boolean;
  hasToolbarSelect: boolean;
  showToolbarSelect?: boolean;
  showAddButton: boolean;
  hasToolbarExtra: boolean;
}

export interface ListToolbarVisibility {
  searchInput: boolean;
  toolbarSelect: boolean;
  toolbar: boolean;
}

export function resolveListToolbarVisibility({
  searchable,
  showSearchInput,
  hasToolbarSelect,
  showToolbarSelect,
  showAddButton,
  hasToolbarExtra,
}: ListToolbarVisibilityOptions): ListToolbarVisibility {
  const searchInput = showSearchInput ?? searchable;
  const toolbarSelect = hasToolbarSelect && showToolbarSelect !== false;
  return {
    searchInput,
    toolbarSelect,
    toolbar: searchInput || toolbarSelect || showAddButton || hasToolbarExtra,
  };
}

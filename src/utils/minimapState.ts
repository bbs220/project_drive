type typeMinimapState = {
  wrapperElement: HTMLDivElement | null;
  northElement: HTMLDivElement | null;
  isExpanded: boolean;
};

// shared minimap elements and expansion state
export const minimapState: typeMinimapState = {
  wrapperElement: null,
  northElement: null,
  isExpanded: false,
};

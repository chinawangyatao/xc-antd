import { ColorPicker, type ColorPickerProps } from 'antd';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { GroupedSelectColor } from './utils';

function normalizeColors(colors: GroupedSelectColor[]) {
  return colors.map((color) => typeof color === 'string'
    ? { value: color, label: color }
    : color);
}

export function GroupedSelectColorPicker({
  colors,
  value,
  onChange,
  ariaLabel = '选择颜色',
  size,
}: {
  colors: GroupedSelectColor[];
  value?: string;
  onChange: (color: string | undefined) => void;
  ariaLabel?: string;
  size?: ColorPickerProps['size'];
}) {
  const [open, setOpen] = useState(false);
  const normalizedColors = normalizeColors(colors);
  const presetColors = normalizedColors.map((color) => color.value);

  const panelRender: ColorPickerProps['panelRender'] = (_, { components }) => (
    <div
      className="ant-color-picker-inner-content"
      aria-label={ariaLabel}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <components.Presets />
    </div>
  );

  return (
    <span
      className="xc-grouped-select__color-picker"
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <ColorPicker
        value={value}
        open={open}
        onOpenChange={setOpen}
        presets={[{ label: '可选颜色', colors: presetColors }]}
        allowClear
        size={size}
        showText={false}
        panelRender={panelRender}
        rootClassName="xc-grouped-select__color-picker-root"
        aria-label={ariaLabel}
        getPopupContainer={(trigger) => trigger.ownerDocument.body}
        onChange={(color) => onChange(color.toHexString())}
        onClear={() => onChange(undefined)}
      />
    </span>
  );
}

export function GroupedSelectColorSwatch({
  color,
  label,
}: {
  color?: string;
  label: ReactNode;
}) {
  return (
    <span className="xc-grouped-select__colored-label">
      {color && (
        <span
          aria-hidden="true"
          className="xc-grouped-select__inline-color"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{label}</span>
    </span>
  );
}

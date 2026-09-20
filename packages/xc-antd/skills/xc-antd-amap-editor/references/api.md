# AmapEditor API

```tsx
const [markers, setMarkers] = useState<AmapLngLat[]>([]);
const [path, setPath] = useState<AmapLngLat[]>([]);

<AmapEditor
  apiKey={import.meta.env.VITE_AMAP_KEY}
  securityJsCode={import.meta.env.VITE_AMAP_SECURITY_CODE}
  markers={markers}
  onMarkersChange={setMarkers}
  path={path}
  onPathChange={setPath}
  clearPreviousMarkers={false}
  controls={{ scale: true, toolBar: true }}
  search={{ city: '青岛', autoMove: true, autoMark: true }}
/>
```

## Data model

- Coordinates are `[longitude, latitude]` tuples using the AMap GCJ-02 system.
- `markers`/`defaultMarkers` own ordinary map pins.
- `path`/`defaultPath` own line nodes. Closing appends the first coordinate to
  the end; `getAmapPathPoints` returns the unique editable nodes.
- `mode` supports `view`, `marker`, and `polyline`. Omit it to let the built-in
  segmented toolbar manage mode internally.
- `closeThreshold` is measured in meters. Clicking near the first point closes
  a path with at least three nodes when `autoClosePath` is enabled.

## Controls and customization

- `controls` enables AMap scale, toolbar, map type, and geolocation controls.
- Toolbar and AMap-control location results render a dedicated current-location
  point with a breathing halo by default. It does not enter `markers`; customize it with
  `locationMarkerProps`, hide it with `showLocationMarker={false}`, and observe
  updates through `onLocationChange`.
- `search` enables POI AutoComplete. `autoMove` defaults to true; `autoMark`
  controls whether selection also adds a marker. Suggestions are queried from
  AMap with a 300ms default debounce and rendered by Ant Design; customize it
  with `debounce`, `city`, `cityLimit`, `type`, and `dataType`.
- Use `onSearchError` for service or credential failures.
- `markerProps`, `linePointProps`, `polylineProps`, `mapProps`, and
  `loaderProps` pass supported @uiw/AMap options through explicit boundaries.
- `showEditorToolbar={false}` hides the built-in edit controls without making
  the data read-only.

## Ref actions

`AmapEditorRef` provides map access, center/zoom changes, `panTo`, `fitView`,
AMap location, `getLocation`/`clearLocation`, marker batch/add/remove/clear,
and path batch/add/undo/close/clear. Controlled callers must apply change
callbacks for the rendered data to update.

Source: `packages/xc-antd/src/AmapEditor/`. Live example: `/amap-editor`.

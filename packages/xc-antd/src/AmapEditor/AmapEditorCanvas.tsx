import React from 'react';
import {
  AimOutlined,
  CheckOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  ExpandOutlined,
  EyeOutlined,
  ShareAltOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { Button, Segmented, Tooltip } from 'antd';
import {
  APILoader,
  CircleMarker,
  Geolocation,
  Map,
  MapTypeControl,
  Marker,
  Polyline,
  ScaleControl,
  ToolBarControl,
} from '@uiw/react-amap';
import { AmapSearchBox } from './AmapSearchBox';
import type {
  AmapEditorMode,
  AmapEditorControls,
  AmapEditorProps,
  AmapEditorRef,
  AmapLngLat,
  AmapMarkersChangeInfo,
  AmapPathChangeInfo,
  AmapSearchResult,
} from './types';
import {
  closeAmapPath,
  findNearestAmapPoint,
  getAmapPathPoints,
  isAmapPathClosed,
  normalizeAmapPath,
  toAmapLngLatTuple,
  undoAmapPath,
} from './utils';

const DEFAULT_CENTER: AmapLngLat = [120.312786, 36.064812];
const DEFAULT_CONTROLS: AmapEditorControls = {};
const EMPTY_POINTS: AmapLngLat[] = [];

type MapRef = React.ElementRef<typeof Map>;

function uniquePlugins(plugins: string[]) {
  return [...new Set(plugins)];
}

const AmapEditorCanvas = React.forwardRef<AmapEditorRef, AmapEditorProps>(
  function AmapEditorCanvas({
    apiKey,
    center,
    defaultCenter = DEFAULT_CENTER,
    onCenterChange,
    zoom,
    defaultZoom = 12,
    onZoomChange,
    markers,
    defaultMarkers = EMPTY_POINTS,
    onMarkersChange,
    path,
    defaultPath = EMPTY_POINTS,
    onPathChange,
    mode,
    defaultMode = 'view',
    onModeChange,
    clearPreviousMarkers = true,
    autoClosePath = true,
    closeThreshold = 20,
    showEditorToolbar = true,
    controls = DEFAULT_CONTROLS,
    search = false,
    onSearchInput,
    onSearchSelect,
    onSearchError,
    onMapClick,
    onMarkerClick,
    showLocationMarker = true,
    locationMarkerProps,
    onLocationChange,
    onLocationError,
    onReady,
    markerProps,
    linePointProps,
    polylineProps,
    mapProps,
    loaderProps,
    children,
  }, ref) {
    const [innerCenter, setInnerCenter] = React.useState(defaultCenter);
    const [innerZoom, setInnerZoom] = React.useState(defaultZoom);
    const [innerMarkers, setInnerMarkers] = React.useState(
      () => normalizeAmapPath(defaultMarkers),
    );
    const [innerPath, setInnerPath] = React.useState(
      () => normalizeAmapPath(defaultPath),
    );
    const [innerMode, setInnerMode] = React.useState(defaultMode);
    const [currentLocation, setCurrentLocation] = React.useState<AmapLngLat>();
    const [locating, setLocating] = React.useState(false);
    const mapRef = React.useRef<MapRef | null>(null);
    const readyMapRef = React.useRef<AMap.Map | undefined>(undefined);

    const currentCenter = center ?? innerCenter;
    const currentZoom = zoom ?? innerZoom;
    const currentMarkers = markers ?? innerMarkers;
    const currentPath = path ?? innerPath;
    const currentMode = mode ?? innerMode;
    const pathPoints = getAmapPathPoints(currentPath);
    const pathClosed = isAmapPathClosed(currentPath);
    const searchOptions = React.useMemo(
      () => search === true ? {} : search || undefined,
      [search],
    );
    const showHeader = showEditorToolbar || Boolean(searchOptions);

    const commitMarkers = React.useCallback((
      nextMarkers: AmapLngLat[],
      info: AmapMarkersChangeInfo,
    ) => {
      const normalized = normalizeAmapPath(nextMarkers);
      if (markers === undefined) setInnerMarkers(normalized);
      onMarkersChange?.(normalized, info);
    }, [markers, onMarkersChange]);

    const commitPath = React.useCallback((
      nextPath: AmapLngLat[],
      info: Omit<AmapPathChangeInfo, 'closed'>,
    ) => {
      const normalized = normalizeAmapPath(nextPath);
      if (path === undefined) setInnerPath(normalized);
      onPathChange?.(normalized, {
        ...info,
        closed: isAmapPathClosed(normalized),
      });
    }, [onPathChange, path]);

    const updateMode = React.useCallback((nextMode: AmapEditorMode) => {
      if (mode === undefined) setInnerMode(nextMode);
      onModeChange?.(nextMode);
    }, [mode, onModeChange]);

    const addMarker = React.useCallback((
      position: AmapLngLat,
      action: AmapMarkersChangeInfo['action'] = 'add',
    ) => {
      const next = clearPreviousMarkers
        ? [position]
        : [...currentMarkers, position];
      commitMarkers(next, {
        action,
        position,
        index: clearPreviousMarkers ? 0 : next.length - 1,
      });
    }, [clearPreviousMarkers, commitMarkers, currentMarkers]);

    const removeLastMarker = React.useCallback(() => {
      if (!currentMarkers.length) return;
      commitMarkers(currentMarkers.slice(0, -1), {
        action: 'remove-last',
        index: currentMarkers.length - 1,
      });
    }, [commitMarkers, currentMarkers]);

    const clearMarkers = React.useCallback(() => {
      if (!currentMarkers.length) return;
      commitMarkers([], { action: 'clear' });
    }, [commitMarkers, currentMarkers.length]);

    const setPath = React.useCallback((nextPath: AmapLngLat[]) => {
      commitPath(nextPath, { action: 'replace' });
    }, [commitPath]);

    const addPathPoint = React.useCallback((position: AmapLngLat) => {
      if (pathClosed) return;
      commitPath([...currentPath, position], {
        action: 'add',
        position,
        index: currentPath.length,
      });
    }, [commitPath, currentPath, pathClosed]);

    const closePath = React.useCallback(() => {
      if (currentPath.length < 3 || pathClosed) return;
      commitPath(closeAmapPath(currentPath), {
        action: 'close',
        position: currentPath[0],
        index: 0,
      });
    }, [commitPath, currentPath, pathClosed]);

    const undoPath = React.useCallback(() => {
      if (!currentPath.length) return;
      commitPath(undoAmapPath(currentPath), { action: 'undo' });
    }, [commitPath, currentPath]);

    const clearPath = React.useCallback(() => {
      if (!currentPath.length) return;
      commitPath([], { action: 'clear' });
    }, [commitPath, currentPath.length]);

    const fitView = React.useCallback(() => {
      const map = mapRef.current?.map;
      if (map?.getAllOverlays().length) {
        map.setFitView(null, false, [48, 48, 48, 48], 18);
      }
    }, []);

    const setCenterValue = React.useCallback((
      nextCenter: AmapLngLat,
      immediately = false,
    ) => {
      const map = mapRef.current?.map;
      if (immediately) map?.setCenter(nextCenter);
      else map?.panTo(nextCenter);
      if (center === undefined) setInnerCenter(nextCenter);
      onCenterChange?.(nextCenter);
    }, [center, onCenterChange]);

    const setZoomValue = React.useCallback((
      nextZoom: number,
      immediately = false,
    ) => {
      mapRef.current?.map?.setZoom(nextZoom, immediately);
      if (zoom === undefined) setInnerZoom(nextZoom);
      onZoomChange?.(nextZoom);
    }, [onZoomChange, zoom]);

    const setZoomAndCenter = React.useCallback((
      nextZoom: number,
      nextCenter: AmapLngLat,
      immediately = false,
    ) => {
      mapRef.current?.map?.setZoomAndCenter(nextZoom, nextCenter, immediately);
      if (zoom === undefined) setInnerZoom(nextZoom);
      if (center === undefined) setInnerCenter(nextCenter);
      onZoomChange?.(nextZoom);
      onCenterChange?.(nextCenter);
    }, [center, onCenterChange, onZoomChange, zoom]);

    const applyLocation = React.useCallback((
      position: AmapLngLat,
      result?: AMap.GeolocationResult,
    ) => {
      setCurrentLocation(position);
      setCenterValue(position);
      onLocationChange?.(position, result);
    }, [onLocationChange, setCenterValue]);

    const locate = React.useCallback(() => new Promise<AmapLngLat>((resolve, reject) => {
      setLocating(true);
      try {
        AMap.plugin(['AMap.Geolocation'], () => {
          const geolocation = new AMap.Geolocation({
            convert: true,
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10_000,
            showButton: false,
            showCircle: false,
            showMarker: false,
          });
          geolocation.getCurrentPosition((status, result) => {
            setLocating(false);
            if (status === 'complete' && result.position) {
              const position = toAmapLngLatTuple(result.position);
              applyLocation(position, result);
              resolve(position);
              return;
            }
            const failedResult = result as unknown as AMap.GeolocationError;
            reject(new Error(
              [failedResult.info, failedResult.message]
                .filter(Boolean)
                .map(String)
                .join('：') || '定位失败',
            ));
          });
        });
      } catch (error) {
        setLocating(false);
        reject(error);
      }
    }), [applyLocation]);

    React.useImperativeHandle(ref, () => ({
      getMap: () => mapRef.current?.map,
      getCenter: () => {
        const mapCenter = mapRef.current?.map?.getCenter();
        return mapCenter ? toAmapLngLatTuple(mapCenter) : currentCenter;
      },
      getZoom: () => mapRef.current?.map?.getZoom() ?? currentZoom,
      setCenter: setCenterValue,
      setZoom: setZoomValue,
      setZoomAndCenter,
      panTo: (position) => setCenterValue(position),
      fitView,
      locate,
      getLocation: () => currentLocation,
      clearLocation: () => setCurrentLocation(undefined),
      setMarkers: (nextMarkers) => commitMarkers(nextMarkers, { action: 'replace' }),
      addMarker,
      removeLastMarker,
      clearMarkers,
      setPath,
      addPathPoint,
      undoPath,
      closePath,
      clearPath,
      clearAll: () => {
        clearMarkers();
        clearPath();
      },
    }), [
      addMarker,
      addPathPoint,
      clearMarkers,
      clearPath,
      closePath,
      commitMarkers,
      currentCenter,
      currentLocation,
      currentZoom,
      fitView,
      locate,
      removeLastMarker,
      setCenterValue,
      setPath,
      setZoomAndCenter,
      setZoomValue,
      undoPath,
    ]);

    const setMapRef = React.useCallback((instance: MapRef | null) => {
      mapRef.current = instance;
      const map = instance?.map;
      if (map && readyMapRef.current !== map) {
        readyMapRef.current = map;
        onReady?.(map);
      }
    }, [onReady]);

    const handleMapClick = React.useCallback((event: AMap.MapsEvent) => {
      const position = toAmapLngLatTuple(event.lnglat);
      onMapClick?.(position, event);
      if (currentMode === 'marker') {
        addMarker(position);
      } else if (currentMode === 'polyline' && !pathClosed) {
        const nearestIndex = findNearestAmapPoint(
          pathPoints,
          position,
          Math.max(0, closeThreshold),
        );
        if (autoClosePath && pathPoints.length >= 3 && nearestIndex === 0) {
          closePath();
        } else {
          addPathPoint(position);
        }
      }
      mapProps?.onClick?.(event);
    }, [
      addMarker,
      addPathPoint,
      autoClosePath,
      closePath,
      closeThreshold,
      currentMode,
      mapProps,
      onMapClick,
      pathClosed,
      pathPoints,
    ]);

    const handleMoveEnd = React.useCallback(() => {
      const nextCenter = mapRef.current?.map?.getCenter();
      if (nextCenter) {
        const tuple = toAmapLngLatTuple(nextCenter);
        if (center === undefined) setInnerCenter(tuple);
        onCenterChange?.(tuple);
      }
      mapProps?.onMoveEnd?.();
    }, [center, mapProps, onCenterChange]);

    const handleZoomEnd = React.useCallback(() => {
      const nextZoom = mapRef.current?.map?.getZoom();
      if (typeof nextZoom === 'number') {
        if (zoom === undefined) setInnerZoom(nextZoom);
        onZoomChange?.(nextZoom);
      }
      mapProps?.onZoomEnd?.();
    }, [mapProps, onZoomChange, zoom]);

    const handleSearchSelect = React.useCallback((result: AmapSearchResult) => {
      const position = result.position;
      if (searchOptions?.autoMove !== false) setCenterValue(position);
      if (searchOptions?.autoMark) addMarker(position, 'search');
      onSearchSelect?.(result);
    }, [addMarker, onSearchSelect, searchOptions, setCenterValue]);

    const requiredPlugins = [
      ...(loaderProps?.plugins ?? []),
      ...(searchOptions ? ['AMap.AutoComplete'] : []),
      ...(controls.scale ? ['AMap.Scale'] : []),
      ...(controls.toolBar ? ['AMap.ToolBar'] : []),
      ...(controls.mapType ? ['AMap.MapType'] : []),
      ...(controls.geolocation ? ['AMap.Geolocation'] : []),
    ];

    return (
      <APILoader
        {...loaderProps}
        akey={apiKey}
        version={loaderProps?.version ?? '2.0'}
        plugins={uniquePlugins(requiredPlugins)}
      >
        <div className="xc-amap-editor__content">
          {showHeader && (
            <div className="xc-amap-editor__toolbar">
              {searchOptions && (
                <div className="xc-amap-editor__search">
                  <AmapSearchBox
                    options={searchOptions}
                    onInput={onSearchInput}
                    onSelect={handleSearchSelect}
                    onError={onSearchError}
                  />
                </div>
              )}
              {showEditorToolbar && (
                <>
                  <Segmented<AmapEditorMode>
                    value={currentMode}
                    options={[
                      { label: '浏览', value: 'view', icon: <EyeOutlined /> },
                      { label: '打点', value: 'marker', icon: <EnvironmentOutlined /> },
                      { label: '划线', value: 'polyline', icon: <ShareAltOutlined /> },
                    ]}
                    onChange={updateMode}
                  />
                  <div className="xc-amap-editor__actions">
                    {currentMode === 'marker' && (
                      <Tooltip title="撤销最后一个标点">
                        <Button
                          aria-label="撤销最后一个标点"
                          icon={<UndoOutlined />}
                          disabled={!currentMarkers.length}
                          onClick={removeLastMarker}
                        />
                      </Tooltip>
                    )}
                    {currentMode === 'polyline' && (
                      <>
                        <Tooltip title="撤销路径节点">
                          <Button
                            aria-label="撤销路径节点"
                            icon={<UndoOutlined />}
                            disabled={!currentPath.length}
                            onClick={undoPath}
                          />
                        </Tooltip>
                        <Tooltip title="闭合路径">
                          <Button
                            aria-label="闭合路径"
                            icon={<CheckOutlined />}
                            disabled={pathPoints.length < 3 || pathClosed}
                            onClick={closePath}
                          />
                        </Tooltip>
                      </>
                    )}
                    {currentMode !== 'view' && (
                      <Tooltip title={currentMode === 'marker' ? '清空标点' : '清空路径'}>
                        <Button
                          danger
                          aria-label={currentMode === 'marker' ? '清空标点' : '清空路径'}
                          icon={<DeleteOutlined />}
                          disabled={currentMode === 'marker'
                            ? !currentMarkers.length
                            : !currentPath.length}
                          onClick={currentMode === 'marker' ? clearMarkers : clearPath}
                        />
                      </Tooltip>
                    )}
                    <Tooltip title="适配全部覆盖物">
                      <Button
                        aria-label="适配全部覆盖物"
                        icon={<ExpandOutlined />}
                        disabled={!currentMarkers.length && !currentPath.length}
                        onClick={fitView}
                      />
                    </Tooltip>
                    <Tooltip title="定位当前位置">
                      <Button
                        aria-label="定位当前位置"
                        icon={<AimOutlined />}
                        loading={locating}
                        disabled={locating}
                        onClick={() => {
                          void locate().catch((error: unknown) => onLocationError?.(error));
                        }}
                      />
                    </Tooltip>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="xc-amap-editor__map">
            <Map
              {...mapProps}
              ref={setMapRef}
              className="xc-amap-editor__map-instance"
              style={{ width: '100%', height: '100%' }}
              center={currentCenter}
              zoom={currentZoom}
              onClick={handleMapClick}
              onMoveEnd={handleMoveEnd}
              onZoomEnd={handleZoomEnd}
              onComplete={(event) => mapProps?.onComplete?.(event)}
            >
              <>
                {controls.scale && <ScaleControl position="LB" offset={[16, 20]} />}
                {controls.toolBar && <ToolBarControl position="RB" offset={[16, 16]} />}
                {controls.mapType && <MapTypeControl />}
                {controls.geolocation && (
                  <Geolocation
                    position="RB"
                    offset={[16, 120]}
                    showButton
                    showMarker={false}
                    showCircle={false}
                    panToLocation={false}
                    zoomToAccuracy={false}
                    onComplete={(result) => {
                      applyLocation(toAmapLngLatTuple(result.position), result);
                    }}
                    onError={(error) => onLocationError?.(new Error(
                      [error.info, error.message]
                        .filter(Boolean)
                        .map(String)
                        .join('：') || '定位失败',
                    ))}
                  />
                )}
                {showLocationMarker && currentLocation && (
                  <Marker
                    position={currentLocation}
                    anchor="center"
                    bubble={false}
                    zIndex={200}
                  >
                    <span
                      className="xc-amap-editor__location-marker"
                      role="img"
                      aria-label="当前位置"
                      style={{
                        '--xc-amap-location-size': `${(locationMarkerProps?.radius ?? 8) * 2}px`,
                        '--xc-amap-location-color': locationMarkerProps?.fillColor ?? '#1677ff',
                        '--xc-amap-location-opacity': locationMarkerProps?.fillOpacity ?? 1,
                        '--xc-amap-location-border-color': locationMarkerProps?.strokeColor ?? '#ffffff',
                        '--xc-amap-location-border-width': `${locationMarkerProps?.strokeWeight ?? 3}px`,
                      } as React.CSSProperties}
                    >
                      <span className="xc-amap-editor__location-ring" />
                      <span className="xc-amap-editor__location-dot" />
                    </span>
                  </Marker>
                )}
                {currentMarkers.map((position, index) => (
                  <Marker
                    {...markerProps}
                    key={`${position[0]}-${position[1]}-${index}`}
                    position={position}
                    onClick={(event) => onMarkerClick?.(position, index, event)}
                  />
                ))}
                {pathPoints.map((position, index) => (
                  <CircleMarker
                    {...linePointProps}
                    key={`path-${position[0]}-${position[1]}-${index}`}
                    center={position}
                    radius={linePointProps?.radius ?? 7}
                    fillColor={linePointProps?.fillColor ?? '#1677ff'}
                    fillOpacity={linePointProps?.fillOpacity ?? 0.9}
                    strokeColor={linePointProps?.strokeColor ?? '#ffffff'}
                    strokeWeight={linePointProps?.strokeWeight ?? 2}
                    bubble={false}
                    cursor="pointer"
                    onClick={() => {
                      if (currentMode === 'polyline' && index === 0
                        && pathPoints.length >= 3 && !pathClosed) closePath();
                    }}
                  />
                ))}
                {currentPath.length >= 2 && (
                  <Polyline
                    {...polylineProps}
                    path={currentPath}
                    strokeColor={polylineProps?.strokeColor ?? '#1677ff'}
                    strokeWeight={polylineProps?.strokeWeight ?? 4}
                    strokeOpacity={polylineProps?.strokeOpacity ?? 0.85}
                    strokeStyle={polylineProps?.strokeStyle ?? 'solid'}
                    strokeDasharray={polylineProps?.strokeStyle === 'dashed'
                      ? polylineProps.strokeDasharray ?? [10, 6]
                      : polylineProps?.strokeDasharray}
                    lineJoin={polylineProps?.lineJoin ?? 'round'}
                    lineCap={polylineProps?.lineCap ?? 'round'}
                  />
                )}
                {children}
              </>
            </Map>
          </div>
        </div>
      </APILoader>
    );
  },
);

AmapEditorCanvas.displayName = 'AmapEditorCanvas';

export default AmapEditorCanvas;

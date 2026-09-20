/// <reference types="@uiw/react-amap-types" />

import type { CSSProperties, ReactNode } from 'react';
import type {
  APILoaderProps,
  CircleMarkerProps,
  MapProps,
  MarkerProps,
  PolylineProps,
} from '@uiw/react-amap';

export type AmapLngLat = [number, number];
export type AmapEditorMode = 'view' | 'marker' | 'polyline';

export interface AmapEditorControls {
  scale?: boolean;
  toolBar?: boolean;
  mapType?: boolean;
  geolocation?: boolean;
}

export interface AmapEditorSearchOptions {
  city?: string;
  cityLimit?: boolean;
  type?: string;
  dataType?: 'all' | 'bus' | 'poi' | 'busline';
  debounce?: number;
  placeholder?: string;
  autoMove?: boolean;
  autoMark?: boolean;
}

export interface AmapSearchResult {
  id: string;
  name: string;
  district: string;
  adcode: string;
  type: string;
  address: string;
  position: AmapLngLat;
  raw: AMap.Tip;
}

export type AmapMarkersChangeAction =
  | 'add'
  | 'search'
  | 'replace'
  | 'remove-last'
  | 'clear';

export interface AmapMarkersChangeInfo {
  action: AmapMarkersChangeAction;
  position?: AmapLngLat;
  index?: number;
}

export type AmapPathChangeAction = 'add' | 'replace' | 'undo' | 'clear' | 'close';

export interface AmapPathChangeInfo {
  action: AmapPathChangeAction;
  position?: AmapLngLat;
  index?: number;
  closed: boolean;
}

export type AmapEditorMapProps = Omit<
  MapProps,
  | 'center'
  | 'children'
  | 'className'
  | 'container'
  | 'style'
  | 'zoom'
>;

export type AmapEditorMarkerProps = Omit<
  MarkerProps,
  'AMap' | 'children' | 'map' | 'onClick' | 'position'
>;

export type AmapEditorLinePointProps = Omit<
  CircleMarkerProps,
  'AMap' | 'center' | 'map' | 'onClick'
>;

export type AmapEditorPolylineProps = Omit<
  PolylineProps,
  'AMap' | 'map' | 'path'
>;

export type AmapEditorLoaderProps = Omit<APILoaderProps, 'akey' | 'children'>;

export interface AmapEditorProps {
  apiKey: string;
  securityJsCode?: string;
  center?: AmapLngLat;
  defaultCenter?: AmapLngLat;
  onCenterChange?: (center: AmapLngLat) => void;
  zoom?: number;
  defaultZoom?: number;
  onZoomChange?: (zoom: number) => void;
  markers?: AmapLngLat[];
  defaultMarkers?: AmapLngLat[];
  onMarkersChange?: (
    markers: AmapLngLat[],
    info: AmapMarkersChangeInfo,
  ) => void;
  path?: AmapLngLat[];
  defaultPath?: AmapLngLat[];
  onPathChange?: (path: AmapLngLat[], info: AmapPathChangeInfo) => void;
  mode?: AmapEditorMode;
  defaultMode?: AmapEditorMode;
  onModeChange?: (mode: AmapEditorMode) => void;
  clearPreviousMarkers?: boolean;
  autoClosePath?: boolean;
  closeThreshold?: number;
  showEditorToolbar?: boolean;
  controls?: AmapEditorControls;
  search?: boolean | AmapEditorSearchOptions;
  onSearchInput?: (keyword: string) => void;
  onSearchSelect?: (result: AmapSearchResult) => void;
  onSearchError?: (error: Error) => void;
  onMapClick?: (position: AmapLngLat, event: AMap.MapsEvent) => void;
  onMarkerClick?: (
    position: AmapLngLat,
    index: number,
    event: AMap.MapsEvent,
  ) => void;
  showLocationMarker?: boolean;
  locationMarkerProps?: AmapEditorLinePointProps;
  onLocationChange?: (
    position: AmapLngLat,
    result?: AMap.GeolocationResult,
  ) => void;
  onLocationError?: (error: unknown) => void;
  onReady?: (map: AMap.Map) => void;
  markerProps?: AmapEditorMarkerProps;
  linePointProps?: AmapEditorLinePointProps;
  polylineProps?: AmapEditorPolylineProps;
  mapProps?: AmapEditorMapProps;
  loaderProps?: AmapEditorLoaderProps;
  height?: CSSProperties['height'];
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface AmapEditorRef {
  getMap: () => AMap.Map | undefined;
  getCenter: () => AmapLngLat;
  getZoom: () => number;
  setCenter: (center: AmapLngLat, immediately?: boolean) => void;
  setZoom: (zoom: number, immediately?: boolean) => void;
  setZoomAndCenter: (
    zoom: number,
    center: AmapLngLat,
    immediately?: boolean,
  ) => void;
  panTo: (position: AmapLngLat) => void;
  fitView: () => void;
  locate: () => Promise<AmapLngLat>;
  getLocation: () => AmapLngLat | undefined;
  clearLocation: () => void;
  setMarkers: (markers: AmapLngLat[]) => void;
  addMarker: (position: AmapLngLat) => void;
  removeLastMarker: () => void;
  clearMarkers: () => void;
  setPath: (path: AmapLngLat[]) => void;
  addPathPoint: (position: AmapLngLat) => void;
  undoPath: () => void;
  closePath: () => void;
  clearPath: () => void;
  clearAll: () => void;
}

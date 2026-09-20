import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { AmapEditor } from '../src/AmapEditor';
import {
  closeAmapPath,
  findNearestAmapPoint,
  getAmapDistance,
  getAmapPathPoints,
  isAmapPathClosed,
  normalizeAmapPath,
  toAmapSearchResult,
  undoAmapPath,
} from '../src/AmapEditor/utils';
import type { AmapLngLat } from '../src/AmapEditor/types';

const path: AmapLngLat[] = [
  [120.3, 36.06],
  [120.31, 36.07],
  [120.32, 36.06],
];

describe('AmapEditor geometry', () => {
  test('calculates distance and finds nearby points in meters', () => {
    const distance = getAmapDistance([120, 36], [120, 36.001]);
    expect(distance).toBeGreaterThan(110);
    expect(distance).toBeLessThan(112);
    expect(findNearestAmapPoint(path, [120.30001, 36.06001], 5)).toBe(0);
    expect(findNearestAmapPoint(path, [121, 37], 5)).toBe(-1);
  });

  test('closes, opens and normalizes paths without mutating input', () => {
    const closed = closeAmapPath(path);
    expect(closed).toEqual([...path, path[0]]);
    expect(isAmapPathClosed(closed)).toBe(true);
    expect(getAmapPathPoints(closed)).toEqual(path);
    expect(undoAmapPath(closed)).toEqual(path);
    expect(path).toHaveLength(3);

    expect(normalizeAmapPath([
      [120, 36],
      [Number.NaN, 36],
      [181, 36],
    ])).toEqual([[120, 36]]);
  });

  test('maps AMap suggestion data to serializable search results', () => {
    const location = {
      getLng: () => 120.31,
      getLat: () => 36.06,
    } as AMap.LngLat;
    const result = toAmapSearchResult({
      id: 'poi-1',
      name: '五四广场',
      district: '市南区',
      adcode: '370202',
      address: '澳门路',
      city: [],
      location,
      typecode: '110101',
    });
    expect(result).toMatchObject({
      id: 'poi-1',
      name: '五四广场',
      district: '市南区',
      address: '澳门路',
      position: [120.31, 36.06],
    });
  });
});

describe('AmapEditor rendering', () => {
  test('renders an actionable state when the API key is missing', () => {
    const html = renderToStaticMarkup(<AmapEditor apiKey="" height={360} />);
    expect(html).toContain('xc-amap-editor');
    expect(html).toContain('height:360px');
    expect(html).toContain('未配置高德地图 Key');
  });

  test('keeps the browser-only map behind an SSR loading state', () => {
    const html = renderToStaticMarkup(<AmapEditor apiKey="test-key" />);
    expect(html).toContain('正在加载高德地图');
    expect(html).not.toContain('amap-container');
  });
});

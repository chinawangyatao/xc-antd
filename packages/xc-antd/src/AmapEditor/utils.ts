import type { AmapLngLat, AmapSearchResult } from './types';

const EARTH_RADIUS_METERS = 6_371_008.8;

function toRadians(value: number) {
  return value * Math.PI / 180;
}

export function isValidAmapLngLat(value: unknown): value is AmapLngLat {
  return Array.isArray(value)
    && value.length === 2
    && Number.isFinite(value[0])
    && Number.isFinite(value[1])
    && value[0] >= -180
    && value[0] <= 180
    && value[1] >= -90
    && value[1] <= 90;
}

export function normalizeAmapPath(path: readonly AmapLngLat[]) {
  return path.filter(isValidAmapLngLat).map(([lng, lat]) => [lng, lat] as AmapLngLat);
}

export function getAmapDistance(
  first: AmapLngLat,
  second: AmapLngLat,
) {
  const firstLatitude = toRadians(first[1]);
  const secondLatitude = toRadians(second[1]);
  const latitudeDelta = secondLatitude - firstLatitude;
  const longitudeDelta = toRadians(second[0] - first[0]);
  const halfChord = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude)
    * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(halfChord));
}

export function findNearestAmapPoint(
  points: readonly AmapLngLat[],
  target: AmapLngLat,
  threshold: number,
) {
  let nearestIndex = -1;
  let nearestDistance = Number.POSITIVE_INFINITY;
  points.forEach((point, index) => {
    const distance = getAmapDistance(point, target);
    if (distance <= threshold && distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });
  return nearestIndex;
}

export function isAmapPathClosed(path: readonly AmapLngLat[]) {
  return path.length >= 4 && getAmapDistance(path[0], path[path.length - 1]) < 0.1;
}

export function closeAmapPath(path: readonly AmapLngLat[]) {
  if (path.length < 3 || isAmapPathClosed(path)) return [...path];
  return [...path, [...path[0]] as AmapLngLat];
}

export function getAmapPathPoints(path: readonly AmapLngLat[]) {
  return isAmapPathClosed(path) ? path.slice(0, -1) : [...path];
}

export function undoAmapPath(path: readonly AmapLngLat[]) {
  return path.length ? path.slice(0, -1) : [];
}

export function toAmapLngLatTuple(value: AMap.LngLat): AmapLngLat {
  const longitude = value.getLng?.() ?? value.lng;
  const latitude = value.getLat?.() ?? value.lat;
  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    throw new TypeError('AMap returned an invalid longitude or latitude.');
  }
  return [longitude, latitude];
}

export function toAmapSearchResult(tip: AMap.Tip): AmapSearchResult | undefined {
  if (!tip.location) return undefined;
  return {
    id: tip.id ?? '',
    name: tip.name ?? '',
    district: tip.district ?? '',
    adcode: tip.adcode ?? '',
    type: tip.typecode ?? '',
    address: tip.address ?? '',
    position: toAmapLngLatTuple(tip.location),
    raw: tip,
  };
}

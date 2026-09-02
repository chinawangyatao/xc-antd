import type { DependencyList, EffectCallback } from 'react';
import { useEffect, useRef } from 'react';
import { isDeepEqualReact } from '../isDeepEqualReact';
import { useDebounceFn } from './useDebounceFn';

export const isDeepEqual = (a: any, b: any, ignoreKeys?: string[]) =>
  isDeepEqualReact(a, b, ignoreKeys);

export function useDeepCompareMemoize<T>(value: T, ignoreKeys?: any): T {
  const ref = useRef<T | undefined>(undefined);
  if (!isDeepEqual(value, ref.current, ignoreKeys)) {
    ref.current = value;
  }
  return ref.current as T;
}

export function useDeepCompareEffect(
  effect: EffectCallback,
  dependencies: DependencyList,
  ignoreKeys?: string[],
) {
  useEffect(effect, useDeepCompareMemoize(dependencies || [], ignoreKeys));
}

export function useDeepCompareEffectDebounce(
  effect: EffectCallback,
  dependencies: DependencyList,
  ignoreKeys?: string[],
  waitTime?: number,
) {
  const effectDn = useDebounceFn(async () => {
    effect();
  }, waitTime || 16);
  useEffect(
    () => {
      effectDn.run();
    },
    useDeepCompareMemoize(dependencies || [], ignoreKeys),
  );
}

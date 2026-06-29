import React from 'react';
import { useDeepCompareMemoize } from './useDeepCompareEffect';

function useDeepCompareMemo<T>(
  factory: () => T,
  dependencies: React.DependencyList,
) {
  return React.useMemo(
    factory,
    useDeepCompareMemoize(dependencies) as unknown as React.DependencyList,
  );
}

export default useDeepCompareMemo;

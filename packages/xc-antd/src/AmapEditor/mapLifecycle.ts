type AmapMapTeardownTarget = Pick<AMap.Map, 'clearMap' | 'destroy'>;

export interface AmapMapTeardownController {
  beginUnmount: () => void;
  resume: () => void;
}

type TeardownScheduler = (callback: () => void) => void;

const controllers = new WeakMap<object, AmapMapTeardownController>();

export function installAmapMapTeardownGuard(
  map: AmapMapTeardownTarget,
  schedule: TeardownScheduler = queueMicrotask,
): AmapMapTeardownController {
  const existingController = controllers.get(map as object);
  if (existingController) {
    existingController.resume();
    return existingController;
  }

  const clearMap = map.clearMap.bind(map);
  const destroy = map.destroy.bind(map);
  let unmounting = false;
  let teardownScheduled = false;

  map.clearMap = (...args) => {
    if (unmounting) return;
    clearMap(...args);
  };
  map.destroy = (...args) => {
    if (!unmounting) {
      destroy(...args);
      return;
    }
    if (teardownScheduled) return;
    teardownScheduled = true;
    schedule(() => {
      try {
        clearMap();
      } finally {
        destroy(...args);
      }
    });
  };

  const controller: AmapMapTeardownController = {
    beginUnmount: () => {
      unmounting = true;
    },
    resume: () => {
      unmounting = false;
      teardownScheduled = false;
    },
  };
  controllers.set(map as object, controller);
  return controller;
}

let index = 0;
let genNanoid = (t = 21) => {
  if (typeof window === 'undefined') return (index += 1).toFixed(0);
  if (!window.crypto) return (index += 1).toFixed(0);
  let e = '',
    r = crypto.getRandomValues(new Uint8Array(t));
  for (; t--; ) {
    let n = 63 & r[t];
    e +=
      n < 36
        ? n.toString(36)
        : n < 62
          ? (n - 26).toString(36).toUpperCase()
          : n < 63
            ? '_'
            : '-';
  }
  return e;
};

export const nanoid = (): string => {
  if (typeof window === 'undefined') return genNanoid();
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return genNanoid();
};

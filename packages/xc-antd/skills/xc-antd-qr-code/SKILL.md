---
name: xc-antd-qr-code
description: Build, integrate, or troubleshoot xc-antd QRCode in React. Use for SVG or Canvas QR codes, logos, error correction, quiet-zone margins, expired/loading/scanned states, or qrcode.react behavior. Do not use for barcode formats other than QR Code.
---

# xc-antd QRCode

Use the public `QRCode` API instead of importing `qrcode.react` in business
screens.

```tsx
<QRCode
  value="https://example.com/order/123"
  level="H"
  imageSettings={{
    src: logoUrl,
    width: 32,
    height: 32,
    excavate: true,
  }}
/>
```

## Source of truth

Inside this repository, inspect:

- `packages/xc-antd/src/QRCode/types.ts`
- `packages/xc-antd/src/QRCode/QRCode.tsx`
- `apps/docs/src/pages/QRCodeDemo.tsx`

In a consuming project, inspect its installed
`node_modules/xc-antd/src/QRCode/` source and types; installed source wins over
this Skill.

## Working rules

- Prefer the default SVG mode for responsive UI and printing. Use Canvas when a
  workflow needs pixel extraction or Canvas-specific processing.
- Use `level="H"` and `imageSettings.excavate=true` when placing a logo over the
  code. Keep the logo small enough to preserve scan reliability.
- Keep a quiet zone with `marginSize`; do not use the deprecated
  `includeMargin` prop.
- `loading`, `expired`, and `scanned` are visual business states. They do not
  alter the encoded value.
- Remote logo images can taint Canvas exports unless CORS is configured and
  `imageSettings.crossOrigin` is appropriate.

## Verification

Run the QRCode tests, typecheck, ESLint, library build, docs build, and the
`/qr-code` example when changing this component.

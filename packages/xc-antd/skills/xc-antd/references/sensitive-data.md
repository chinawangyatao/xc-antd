# SensitiveData

`SensitiveData` masks sensitive text or images and optionally reveals them on
user action. It is a display/privacy component, not cryptographic encryption.

Use local masking only when the frontend may receive plaintext:

```tsx
<SensitiveData type="phone" value="15624181187" />
```

Use request reveal when the initial payload must remain masked:

```tsx
<SensitiveData
  type="address"
  value="山东省青岛市********"
  revealMode="request"
  request={async (params, { signal }) => {
    const response = await fetch(`/api/address/${params.id}`, { signal })
    const result = await response.json()
    return result.data
  }}
  requestParams={{ id: 'customer-1' }}
/>
```

- `local` mode derives the mask in the browser and toggles the supplied original value.
- `request` mode displays `value` unchanged as the masked payload and calls `request`
  only when revealing. It aborts stale requests and clears the returned plaintext on hide.
- Supported types are `phone`, `email`, `name`, `number`, `id`, `idCard`,
  `bankCard`, `address`, `key`, `text`, and `image`.
- `request` must resolve directly to a string. Map business response envelopes in
  the callback rather than teaching the component API-specific success codes.
- For images, the requested string is the image URL; Ant Design preview is enabled
  by default. Use `placeholderImage`, `imageProps`, `width`, and `height` for display.
- Use `mask` for a business-specific local rule, or exported helpers such as
  `maskSensitiveValue` when masking outside the component.
- Treat reveal authorization, auditing, rate limits, and transport security as
  server responsibilities. UI masking is not an authorization boundary.

Source: `packages/xc-antd/src/SensitiveData/`; live example: `/sensitive-data`.

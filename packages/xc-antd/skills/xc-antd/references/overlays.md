# ActionDrawer and ActionModal

Use these components when confirm/cancel layout, async confirmation, and unsaved-change interception should be consistent.

```tsx
<ActionDrawer
  title="新增数据"
  open={open}
  onOpenChange={setOpen}
  form={form}
  onConfirm={async () => {
    await form.validateFields();
    await save();
    return true;
  }}
>
  <Form form={form}>{children}</Form>
</ActionDrawer>
```

`ActionModal` uses the same action contract.

Important behavior:

- The caller owns `open`; the component requests closing through `onOpenChange(false)`.
- `onConfirm` can be async. Returning `false` keeps the overlay open; thrown validation/request errors also keep it open.
- `confirmLoading` overrides internal async loading when externally controlled.
- Pass `form` or `hasUnsavedChanges` to enable close interception. Set `unsavedChangesPrompt={false}` to disable it deliberately.
- Mask, close, and cancel actions share the same unsaved-change path.
- Use `footer={false}` or a custom `footer` only when the standard confirm-first footer is not appropriate.
- Footer order is confirm then cancel and is left aligned by library styles.

Source: `packages/xc-antd/src/ActionOverlay/`; live example: `apps/docs/src/pages/ActionOverlayDemo.tsx`.

# Component API

## Design the boundary

- Name the component for its UI/business role, not its implementation detail.
- Define the minimal wrapper-specific props, then provide an explicit escape hatch for underlying Ant Design props.
- Use generic record/value types where callbacks return consumer data.
- Export public prop and action types from the feature barrel.
- Keep default behavior useful; hide actions that have no handler.

## Controlled and uncontrolled state

- Pair `value` with `onChange`, and `defaultValue` for uncontrolled initialization.
- Decide control with `value !== undefined`, unless the underlying component uses property presence.
- Do not pass `prop={undefined}` to an underlying component that checks `hasOwnProperty(prop)`; conditionally omit it.
- Keep internal state unchanged by controlled updates except for derived display state.

## Async actions

- Await consumer promises before clearing local data or closing overlays.
- Show loading while an action is pending.
- Preserve editable state when save/validation rejects.
- Require confirmation before destructive defaults. Confirmation cancellation must not invoke the business callback.

## Compatibility

- Search repository usage before renaming or deleting.
- Prefer a deprecated type/value alias to a copied compatibility implementation.
- Mention canonical names in docs and examples.
- Remove an old export only when explicitly authorized or when a documented breaking release owns the migration.

## Styling and accessibility

- Scope CSS under the component root.
- Reuse Ant Design tokens/default behavior where possible; avoid global Ant selector overrides.
- Give icon-only buttons an accessible label and usually a tooltip.
- Use semantic buttons instead of clickable `div` elements.
- Verify flex children have correct shrink behavior in narrow toolbars.
- Keep empty, disabled, selected, loading, and error states visually distinct.

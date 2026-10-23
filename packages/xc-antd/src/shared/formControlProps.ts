/** Form.Item 的关联属性和值优先；业务事件先执行，校验事件随后执行且不重复调用。 */
export function mergeFormControlProps(
  fieldProps: Record<string, unknown> = {},
  injectedProps: Record<string, unknown> = {},
): Record<string, unknown> {
  const merged = { ...fieldProps, ...injectedProps };
  for (const key of Object.keys(injectedProps)) {
    const businessHandler = fieldProps[key];
    const formHandler = injectedProps[key];
    if (/^on[A-Z]/.test(key)
      && typeof businessHandler === 'function'
      && typeof formHandler === 'function'
      && businessHandler !== formHandler) {
      merged[key] = (...args: unknown[]) => {
        businessHandler(...args);
        formHandler(...args);
      };
    }
  }
  const describedBy = [fieldProps['aria-describedby'], injectedProps['aria-describedby']]
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
  if (describedBy.length > 0) {
    merged['aria-describedby'] = [...new Set(describedBy.join(' ').split(/\s+/))].join(' ');
  }
  return merged;
}

const proFieldProps = `valueType request formItemRender render text formItemProps valueEnum`;

const proFormProps = `fieldProps isDefaultDom groupProps contentRender submitterProps submitter`;

export function pickProProps(
  props: Record<string, any>,
  customValueType = false,
) {
  const propList = `${proFieldProps} ${proFormProps}`.split(/[\s\n]+/);

  const attrs = {} as Record<string, any>;
  Object.keys(props || {}).forEach((key) => {
    if (propList.includes(key) && !customValueType) {
      return;
    }
    attrs[key] = props[key];
  });
  return attrs;
}

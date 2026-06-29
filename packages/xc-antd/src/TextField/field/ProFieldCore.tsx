import React, { useContext } from 'react';
import type {
  ProFieldFCRenderProps,
  ProRenderFieldPropsType,
} from '../provider';
import ProConfigContext from '../provider';
import {
  omitUndefined,
  pickProProps,
  type ProFieldTextType,
  type ProFieldValueTypeInput,
  useDeepCompareMemo,
  useRefFunction,
} from '../utils';
import './initDayjs';
import type { ProFieldPropsType, ProFieldRenderProps } from './types';

export type ProFieldRenderText = (
  dataValue: ProFieldTextType,
  valueType: ProFieldValueTypeInput,
  props: ProFieldRenderProps,
  valueTypeMap: Record<string, ProRenderFieldPropsType>,
) => React.ReactNode;

export type ProFieldDualRender = {
  renderRead: ProFieldRenderText;
  renderEdit: ProFieldRenderText;
};

export function isProFieldDualRender(
  input: ProFieldRenderText | ProFieldDualRender,
): input is ProFieldDualRender {
  return (
    typeof input === 'object' &&
    input !== null &&
    'renderRead' in input &&
    'renderEdit' in input
  );
}

export interface CreateProFieldOptions {
  pickProPropsWithValueTypeMap: boolean;
}

export function createProField(
  render: ProFieldRenderText | ProFieldDualRender,
  options: CreateProFieldOptions,
) {
  const renderRead = isProFieldDualRender(render) ? render.renderRead : render;
  const renderEdit = isProFieldDualRender(render) ? render.renderEdit : render;

  const ProFieldComponent: React.ForwardRefRenderFunction<
    any,
    ProFieldPropsType
  > = (
    {
      text,
      valueType = 'text',
      mode = 'read',
      onChange,
      formItemRender,
      value,
      readonly,
      fieldProps: restFieldProps,
      ...rest
    },
    ref,
  ) => {
    const context = useContext(ProConfigContext);

    const onChangeCallBack = useRefFunction((...restParams: any[]) => {
      restFieldProps?.onChange?.(...restParams);
      onChange?.(...restParams);
    });

    const fieldProps: any = useDeepCompareMemo(() => {
      return (
        (value !== undefined || restFieldProps) && {
          value,
          ...omitUndefined(restFieldProps),
          onChange: onChangeCallBack,
        }
      );
    }, [value, restFieldProps, onChangeCallBack]);

    const customValueType =
      options.pickProPropsWithValueTypeMap &&
      Object.keys(context.valueTypeMap || {}).includes(String(valueType));

    const effectiveMode = readonly ? 'read' : mode;
    const dataValue =
      mode === 'edit' || mode === 'update'
        ? (fieldProps?.value ?? text ?? '')
        : (text ?? fieldProps?.value ?? '');
    const renderFn =
      effectiveMode === 'edit' || effectiveMode === 'update'
        ? renderEdit
        : renderRead;

    const renderedDom = renderFn(
      dataValue,
      valueType || 'text',
      omitUndefined({
        ref,
        ...rest,
        mode: effectiveMode,
        formItemRender: formItemRender
          ? (
              curText: any,
              props: ProFieldFCRenderProps,
              dom: React.JSX.Element,
            ) => {
              const { placeholder: _placeholder, ...restProps } = props;
              const newDom = formItemRender(curText, restProps, dom);
              if (React.isValidElement(newDom)) {
                return React.cloneElement(newDom, {
                  ...fieldProps,
                  ...((newDom.props as any) || {}),
                });
              }
              return newDom;
            }
          : undefined,
        placeholder: formItemRender
          ? undefined
          : (rest?.placeholder ?? fieldProps?.placeholder),
        fieldProps: pickProProps(
          omitUndefined({
            ...fieldProps,
            placeholder: formItemRender
              ? undefined
              : (rest?.placeholder ?? fieldProps?.placeholder),
          }),
          customValueType,
        ),
      }) as ProFieldRenderProps,
      context.valueTypeMap || {},
    );

    return <React.Fragment>{renderedDom}</React.Fragment>;
  };

  return React.forwardRef(ProFieldComponent);
}

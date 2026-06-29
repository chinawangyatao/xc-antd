import React from 'react';

// ==================== 类型定义 ====================

export type ProSchemaValueEnumType = {
  text: React.ReactNode;
  status?: string;
  color?: string;
  disabled?: boolean;
};

type ProSchemaValueEnumMap = Map<
  string | number | boolean,
  ProSchemaValueEnumType | React.ReactNode
>;

type ProSchemaValueEnumObj = Record<
  string,
  ProSchemaValueEnumType | React.ReactNode
>;

export type BaseProFieldFC = {
  text: React.ReactNode;
  fieldProps?: any;
  mode?: ProFieldFCMode;
  light?: boolean;
  label?: React.ReactNode;
  valueEnum?: ProSchemaValueEnumObj | ProSchemaValueEnumMap;
  proFieldKey?: React.Key;
};

export type ProFieldFCMode = 'read' | 'edit' | 'update';

export type ProFieldFCRenderProps = {
  mode?: ProFieldFCMode;
  readonly?: boolean;
  placeholder?: string | string[];
  value?: any;
  onChange?: (...rest: any[]) => void;
} & BaseProFieldFC;

export type ProRenderFieldPropsType = {
  render?:
    | ((
        text: any,
        props: Omit<ProFieldFCRenderProps, 'value' | 'onChange'>,
        dom: React.JSX.Element,
      ) => React.JSX.Element)
    | undefined;
  formItemRender?:
    | ((
        text: any,
        props: ProFieldFCRenderProps,
        dom: React.JSX.Element,
      ) => React.JSX.Element)
    | undefined;
};

export type ParamsType = Record<string, any>;

export type ConfigContextPropsType = {
  /** 自定义或覆盖 valueType → render */
  valueTypeMap?: Record<string, ProRenderFieldPropsType>;
};

// ==================== Context ====================

const ProConfigContext = React.createContext<ConfigContextPropsType>({
  valueTypeMap: {},
});

export const { Consumer: ConfigConsumer } = ProConfigContext;

ProConfigContext.displayName = 'ProProvider';

export const ProProvider = ProConfigContext;

export default ProConfigContext;

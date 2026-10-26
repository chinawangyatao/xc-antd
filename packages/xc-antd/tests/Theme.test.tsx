import { describe, expect, test } from 'bun:test';
import { ConfigProvider } from 'antd';
import { renderToStaticMarkup } from 'react-dom/server';
import { FormGroup } from '../src/FormGroup';
import { GroupedSelect } from '../src/GroupedSelect';
import { ListPanel } from '../src/ListPanel';
import { ListTree } from '../src/ListTree';
import { xcConfigProviderProps, xcTablePagination, xcTheme } from '../src/theme';

describe('native UI preset', () => {
  test('provides serializable native ConfigProvider configuration', () => {
    const config = JSON.parse(JSON.stringify(xcConfigProviderProps));
    expect(config.theme.token.colorPrimary).toBe('#165DFF');
    expect(config.theme.components.Form.verticalLabelPadding).toBe('0 0 4px');
    expect(config.theme.components.Table.cellPaddingInlineMD).toBe(16);
    expect(config.theme.components.Table.borderColor).toBe('#E5E6EB');
    expect(config.theme.components.Table.headerSplitColor).toBe('transparent');
    expect(config.theme.components.Table.headerBorderRadius).toBe(0);
    expect(config.drawer.closable.placement).toBe('end');
    expect(config.modal.mask.closable).toBe(false);
    expect(xcTheme).toBe(xcConfigProviderProps.theme);
  });

  test('custom components inherit their nearest native theme', () => {
    const html = renderToStaticMarkup(
      <ConfigProvider theme={{ token: { colorPrimary: '#722ED1', colorBgContainer: '#151515' } }}>
        <FormGroup title="分组" />
        <ListPanel data={[{ key: 'one', title: '条目' }]} />
        <ListTree treeData={[{ key: 'one', title: '节点' }]} />
        <GroupedSelect groups={[]} />
      </ConfigProvider>,
    );
    expect(html.match(/--xc-color-primary:#722ed1/gi)).toHaveLength(4);
    expect(html.match(/--xc-color-bg:#151515/g)).toHaveLength(4);
  });

  test('uses the native compact pagination without changing request semantics', () => {
    expect(xcTablePagination.simple).toEqual({ readOnly: true });
    expect(xcTablePagination.showSizeChanger).toBe(true);
    expect(xcTablePagination.showTotal?.(125, [1, 10])).toBe('共 125 条');
  });
});

import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ConfigProvider } from 'antd';
import type { DrawerProps } from 'antd';
import { useDrawerClosable } from '../src/shared/useDrawerClosable';
import {
  ActionOverlayFooter,
  resolveUnsavedChanges,
} from '../src/ActionOverlay/shared';

describe('ActionOverlay footer', () => {
  test('renders confirm before cancel in a left-aligned footer', () => {
    const html = renderToStaticMarkup(
      <ActionOverlayFooter confirmText="confirm" cancelText="cancel" />,
    );
    expect(html).toContain('xc-action-overlay__footer');
    expect(html.indexOf('confirm')).toBeLessThan(html.indexOf('cancel'));
    expect(html).toContain('ant-flex-justify-flex-start');
    expect(html).not.toContain('min-width:88px');
  });

  test('renders modal cancellation first and aligns actions to the right', () => {
    const html = renderToStaticMarkup(
      <ActionOverlayFooter layout="modal" confirmText="confirm-action" cancelText="cancel-action" />,
    );
    expect(html.indexOf('cancel-action')).toBeLessThan(html.indexOf('confirm-action'));
    expect(html).toContain('ant-flex-justify-flex-end');
  });

  test('places drawer closing at the end and retains native configuration', () => {
    let result: DrawerProps['closable'];
    function Probe({ closable }: Pick<DrawerProps, 'closable'>) {
      result = useDrawerClosable(closable);
      return null;
    }
    renderToStaticMarkup(<Probe />);
    expect(result).toEqual({ placement: 'end' });
    renderToStaticMarkup(
      <ConfigProvider drawer={{ closable: { disabled: true } }}>
        <Probe />
      </ConfigProvider>,
    );
    expect(result).toEqual({ placement: 'end', disabled: true });
    renderToStaticMarkup(<Probe closable={false} />);
    expect(result).toBe(false);
    renderToStaticMarkup(<Probe closable={{ placement: 'start' }} />);
    expect(result).toEqual({ placement: 'start' });
  });

  test('resolves controlled, functional and form dirty states', () => {
    expect(resolveUnsavedChanges({ hasUnsavedChanges: true })).toBe(true);
    expect(resolveUnsavedChanges({ hasUnsavedChanges: () => true })).toBe(true);
    expect(resolveUnsavedChanges({
      form: { isFieldsTouched: () => true },
    })).toBe(true);
    expect(resolveUnsavedChanges({
      form: { isFieldsTouched: () => false },
    })).toBe(false);
  });
});

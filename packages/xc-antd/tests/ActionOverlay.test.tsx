import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ActionOverlayFooter } from '../src/ActionOverlay/shared';

describe('ActionOverlay footer', () => {
  test('renders confirm before cancel in a left-aligned footer', () => {
    const html = renderToStaticMarkup(
      <ActionOverlayFooter confirmText="confirm" cancelText="cancel" />,
    );
    expect(html).toContain('xc-action-overlay__footer');
    expect(html.indexOf('confirm')).toBeLessThan(html.indexOf('cancel'));
  });
});

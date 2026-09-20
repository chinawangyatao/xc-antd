import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCode } from '../src/QRCode';

describe('QRCode', () => {
  test('renders an accessible SVG code by default', () => {
    const html = renderToStaticMarkup(
      <QRCode value="https://example.com" title="Example QR code" />,
    );
    expect(html).toContain('xc-qr-code');
    expect(html).toContain('<svg');
    expect(html).toContain('Example QR code');
    expect(html).toContain('width="160"');
  });

  test('supports Canvas and borderless rendering', () => {
    const html = renderToStaticMarkup(
      <QRCode value="canvas-value" renderType="canvas" bordered={false} />,
    );
    expect(html).toContain('<canvas');
    expect(html).toContain('xc-qr-code--borderless');
  });

  test('renders expired and scanned states', () => {
    const expired = renderToStaticMarkup(
      <QRCode value="expired" status="expired" onRefresh={() => undefined} />,
    );
    const scanned = renderToStaticMarkup(
      <QRCode value="scanned" status="scanned" />,
    );
    expect(expired).toContain('点击刷新');
    expect(scanned).toContain('已扫描');
  });

  test('renders an empty state instead of passing an empty value downstream', () => {
    const html = renderToStaticMarkup(<QRCode value="" />);
    expect(html).toContain('暂无二维码内容');
    expect(html).not.toContain('xc-qr-code__image');
  });
});

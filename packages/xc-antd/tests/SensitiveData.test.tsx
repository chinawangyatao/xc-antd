import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { SensitiveData } from '../src/SensitiveData';

describe('SensitiveData', () => {
  test('renders masked local text as an accessible reveal control', () => {
    const html = renderToStaticMarkup(
      <SensitiveData value="15624181187" type="phone" />,
    );
    expect(html).toContain('156****1187');
    expect(html).toContain('aria-label="查看敏感信息"');
    expect(html).toContain('aria-pressed="false"');
  });

  test('supports initially revealed local text and static request text', () => {
    const revealed = renderToStaticMarkup(
      <SensitiveData value="1176317790@qq.com" type="email" defaultRevealed />,
    );
    const request = renderToStaticMarkup(
      <SensitiveData
        value="山东省青岛市********"
        type="address"
        revealMode="request"
      />,
    );
    expect(revealed).toContain('1176317790@qq.com');
    expect(revealed).toContain('aria-pressed="true"');
    expect(request).toContain('山东省青岛市********');
    expect(request).not.toContain('<button');
  });

  test('renders a locked image placeholder before reveal', () => {
    const html = renderToStaticMarkup(
      <SensitiveData
        value="https://example.com/private.jpg"
        type="image"
        width={120}
        height={90}
        placeholderImage={<span>已锁定</span>}
      />,
    );
    expect(html).toContain('xc-sensitive-data__image-placeholder');
    expect(html).toContain('aria-label="查看敏感图片"');
    expect(html).toContain('已锁定');
    expect(html).not.toContain('private.jpg');
  });
});

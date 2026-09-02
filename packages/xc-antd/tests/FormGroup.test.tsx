import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { FormGroup } from '../src/FormGroup';

describe('FormGroup', () => {
  test('renders the group title and semantic section', () => {
    const html = renderToStaticMarkup(
      <FormGroup title="基础信息"><div>字段</div></FormGroup>,
    );
    expect(html).toContain('<section');
    expect(html).toContain('xc-form-group__title');
    expect(html).toContain('基础信息');
  });

  test('omits the header when no title or extra is provided', () => {
    const html = renderToStaticMarkup(<FormGroup><div>字段</div></FormGroup>);
    expect(html).not.toContain('xc-form-group__header');
  });
});

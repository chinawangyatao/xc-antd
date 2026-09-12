import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ImageUpload } from '../src/ImageUpload';

describe('ImageUpload', () => {
  test('renders the Ant Design picture-card upload and constraints', () => {
    const html = renderToStaticMarkup(
      <ImageUpload
        maxCount={3}
        maxSizeMB={2}
        autoUpload={false}
        trigger={<span>上传图片</span>}
      />,
    );

    expect(html).toContain('xc-image-upload');
    expect(html).toContain('上传图片');
    expect(html).toContain('<strong>2 MB</strong>');
    expect(html).toContain('3');
  });

  test('hides the upload trigger when the limit is reached', () => {
    const html = renderToStaticMarkup(
      <ImageUpload
        value={[{
          uid: '1',
          name: 'avatar.png',
          status: 'done',
          url: '/avatar.png',
        }]}
        maxCount={1}
        showTip={false}
      />,
    );

    expect(html).toContain('is-limit-reached');
    expect(html).not.toContain('xc-image-upload__trigger');
  });
});

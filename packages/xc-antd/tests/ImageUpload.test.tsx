import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ImageUpload } from '../src/ImageUpload';
import { ImageCropDrawerFooter } from '../src/ImageUpload/ImageCropDrawer';

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

  test('renders crop completion before cancel in the left-aligned footer', () => {
    const html = renderToStaticMarkup(
      <ImageCropDrawerFooter
        completeText="完成裁剪"
        completeDisabled={false}
        processing={false}
        showSkip={false}
        onComplete={() => undefined}
        onSkip={() => undefined}
        onCancel={() => undefined}
      />,
    );

    expect(html).toContain('xc-image-crop-drawer__footer');
    expect(html.indexOf('完成裁剪')).toBeLessThan(html.indexOf('取 消'));
  });
});

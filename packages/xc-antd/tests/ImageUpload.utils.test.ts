import { describe, expect, test } from 'bun:test';
import {
  createCroppedImageFile,
  resolveImageUploadResponse,
  runWithConcurrency,
  validateImageFile,
} from '../src/ImageUpload/utils';

describe('ImageUpload validation', () => {
  test('validates MIME, extension and size constraints', () => {
    const png = new File(['image'], 'avatar.png', { type: 'image/png' });
    const svg = new File(['image'], 'icon.svg', { type: 'image/svg+xml' });

    expect(validateImageFile(png, {
      accept: 'image/jpeg,image/png',
      maxSizeMB: 1,
    })).toBeUndefined();
    expect(validateImageFile(svg, {
      accept: '.png,.jpg',
      maxSizeMB: 1,
    })).toContain('文件格式');
    expect(validateImageFile(new File([new Uint8Array(2048)], 'large.png', {
      type: 'image/png',
    }), {
      accept: 'image/*',
      maxSizeMB: 0.001,
    })).toContain('超过');
  });
});

describe('ImageUpload response handling', () => {
  test('resolves common upload response shapes', () => {
    expect(resolveImageUploadResponse('https://example.com/a.png'))
      .toEqual({ url: 'https://example.com/a.png' });
    expect(resolveImageUploadResponse({
      data: { url: '/files/a.png', name: 'avatar.png' },
    })).toEqual({ url: '/files/a.png', name: 'avatar.png' });
  });
});

describe('ImageUpload crop output', () => {
  test('creates a typed cropped File from canvas output', async () => {
    const canvas = {
      toBlob: (
        callback: BlobCallback,
        type?: string,
      ) => callback(new Blob(['cropped'], { type })),
    } as HTMLCanvasElement;
    const original = new File(['original'], 'photo.png', { type: 'image/png' });

    const result = await createCroppedImageFile(canvas, original, {
      format: 'webp',
      quality: 0.8,
    });

    expect(result.name).toBe('photo_cropped.webp');
    expect(result.type).toBe('image/webp');
  });

  test('limits concurrent uploads and preserves result order', async () => {
    let active = 0;
    let maxActive = 0;
    const results = await runWithConcurrency([1, 2, 3, 4], 2, async (value) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 2));
      active -= 1;
      return value * 2;
    });

    expect(maxActive).toBe(2);
    expect(results).toEqual([
      { status: 'fulfilled', value: 2 },
      { status: 'fulfilled', value: 4 },
      { status: 'fulfilled', value: 6 },
      { status: 'fulfilled', value: 8 },
    ]);
  });
});

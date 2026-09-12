import type {
  ImageCropFormat,
  ImageCropOptions,
  ImageUploadResolvedResult,
} from './types';

export interface ImageValidationOptions {
  accept: string;
  maxSizeMB: number;
}

export function validateImageFile(
  file: File,
  { accept, maxSizeMB }: ImageValidationOptions,
): string | undefined {
  const acceptedTypes = accept
    .split(',')
    .map((item) => item.trim().toLocaleLowerCase())
    .filter(Boolean);
  const fileType = file.type.toLocaleLowerCase();
  const fileName = file.name.toLocaleLowerCase();
  const accepted = acceptedTypes.length === 0 || acceptedTypes.some((type) => {
    if (type.startsWith('.')) return fileName.endsWith(type);
    if (type.endsWith('/*')) return fileType.startsWith(type.slice(0, -1));
    return fileType === type;
  });

  if (!accepted) return `不支持 ${file.name} 的文件格式`;
  if (maxSizeMB > 0 && file.size > maxSizeMB * 1024 * 1024) {
    return `${file.name} 超过 ${maxSizeMB} MB`;
  }
  return undefined;
}

export function resolveImageUploadResponse(
  response: unknown,
): ImageUploadResolvedResult {
  if (typeof response === 'string') return { url: response };
  if (!response || typeof response !== 'object') return {};
  const record = response as Record<string, unknown>;
  const data = record.data && typeof record.data === 'object'
    ? record.data as Record<string, unknown>
    : undefined;
  const url = [record.url, record.fileName, data?.url, data?.fileName]
    .find((value): value is string => typeof value === 'string');
  const name = [record.name, data?.name]
    .find((value): value is string => typeof value === 'string');
  return { name, url };
}

function getMimeType(format: ImageCropFormat) {
  return `image/${format}`;
}

function getOutputCanvas(
  source: HTMLCanvasElement,
  options: ImageCropOptions,
): HTMLCanvasElement {
  const round = options.shape === 'round' || options.round === true;
  if (!round) return source;

  const output = document.createElement('canvas');
  output.width = source.width;
  output.height = source.height;
  const context = output.getContext('2d');
  if (!context) throw new Error('无法创建图片裁剪 Canvas');

  const format = options.format ?? 'png';
  if (format === 'jpeg') {
    context.fillStyle = options.fillColor ?? '#fff';
    context.fillRect(0, 0, output.width, output.height);
  }
  context.save();
  context.beginPath();
  context.ellipse(
    output.width / 2,
    output.height / 2,
    output.width / 2,
    output.height / 2,
    0,
    0,
    Math.PI * 2,
  );
  context.clip();
  context.drawImage(source, 0, 0);
  context.restore();
  return output;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('生成裁剪图片失败'));
    }, type, quality);
  });
}

export async function createCroppedImageFile(
  canvas: HTMLCanvasElement,
  originalFile: File,
  options: ImageCropOptions,
): Promise<File> {
  const round = options.shape === 'round' || options.round === true;
  const format = options.format ?? (round ? 'png' : 'jpeg');
  const quality = Math.min(1, Math.max(0, options.quality ?? 0.9));
  const outputCanvas = getOutputCanvas(canvas, { ...options, format });
  const blob = await canvasToBlob(outputCanvas, getMimeType(format), quality);
  const baseName = originalFile.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${baseName}_cropped.${format}`, {
    lastModified: Date.now(),
    type: getMimeType(format),
  });
}

export async function runWithConcurrency<T, Result>(
  values: T[],
  concurrency: number,
  worker: (value: T) => Promise<Result>,
): Promise<PromiseSettledResult<Result>[]> {
  const results: PromiseSettledResult<Result>[] = new Array(values.length);
  let nextIndex = 0;
  const workerCount = Math.max(1, Math.min(values.length, Math.floor(concurrency) || 1));

  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = { status: 'fulfilled', value: await worker(values[index]) };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  }));
  return results;
}

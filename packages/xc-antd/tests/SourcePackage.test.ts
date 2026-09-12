import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packageRoot = resolve(import.meta.dir, '..');
const packageJson = JSON.parse(
  readFileSync(resolve(packageRoot, 'package.json'), 'utf8'),
) as {
  exports: Record<string, unknown>;
  dependencies: Record<string, string>;
  files: string[];
  main: string;
  module: string;
  source: string;
  types: string;
};

describe('xc-antd source package', () => {
  test('publishes the TypeScript source entry instead of dist', () => {
    const rootExport = packageJson.exports['.'] as Record<string, string>;
    expect(packageJson.main).toBe('./src/index.ts');
    expect(packageJson.module).toBe('./src/index.ts');
    expect(packageJson.source).toBe('./src/index.ts');
    expect(packageJson.types).toBe('./src/index.ts');
    expect(packageJson.files).toContain('src');
    expect(packageJson.files).not.toContain('dist');
    expect(rootExport.import).toBe('./src/index.ts');
    expect(rootExport.types).toBe('./src/index.ts');
    expect(rootExport.require).toBeUndefined();
  });

  test('does not create nested package boundaries under source', () => {
    expect(existsSync(resolve(packageRoot, 'src/TextField/package.json'))).toBe(false);
  });

  test('declares packages imported directly by the published source', () => {
    const directSourceDependencies = [
      '@ant-design/cssinjs',
      '@dnd-kit/react',
      '@rc-component/util',
      '@tanstack/react-table',
      'antd-style',
      'clsx',
      'dayjs',
      'react-advanced-cropper',
      'react-highlight-words',
      'swr',
      'tailwindcss',
    ];

    for (const dependency of directSourceDependencies) {
      expect(packageJson.dependencies[dependency]).toBeString();
    }
  });
});

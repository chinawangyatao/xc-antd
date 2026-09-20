import { afterEach, describe, expect, test } from 'bun:test';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const installer = resolve(import.meta.dir, '../scripts/install-skills.mjs');
const temporaryDirectories: string[] = [];

function createTemporaryProject() {
  const directory = mkdtempSync(join(tmpdir(), 'xc-antd-skills-'));
  temporaryDirectories.push(directory);
  return directory;
}

function runInstaller(cwd: string, ...argumentsToPass: string[]) {
  return spawnSync(process.execPath, [installer, 'install', ...argumentsToPass], {
    cwd,
    encoding: 'utf8',
  });
}

afterEach(() => {
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { force: true, recursive: true });
  });
});

describe('xc-antd skill installer', () => {
  test('installs all consumer skills by default', () => {
    const project = createTemporaryProject();
    const result = runInstaller(project);

    expect(result.status).toBe(0);
    expect(existsSync(join(project, '.agents/skills/xc-antd/SKILL.md'))).toBe(true);
    expect(existsSync(
      join(project, '.agents/skills/xc-antd-image-upload/SKILL.md'),
    )).toBe(true);
    expect(existsSync(
      join(project, '.agents/skills/xc-antd-rich-text-editor/SKILL.md'),
    )).toBe(true);
    expect(existsSync(
      join(project, '.agents/skills/xc-antd-amap-editor/SKILL.md'),
    )).toBe(true);
    expect(existsSync(
      join(project, '.agents/skills/xc-antd-component-authoring/SKILL.md'),
    )).toBe(false);
  });

  test('installs all skills and updates matching skills with --force', () => {
    const project = createTemporaryProject();
    expect(runInstaller(project, '--all').status).toBe(0);

    const installedSkill = join(project, '.agents/skills/xc-antd/SKILL.md');
    writeFileSync(installedSkill, `${readFileSync(installedSkill, 'utf8')}\nchanged\n`);
    expect(runInstaller(project, '--all', '--force').status).toBe(0);
    expect(readFileSync(installedSkill, 'utf8')).not.toContain('\nchanged\n');
    expect(existsSync(
      join(project, '.agents/skills/xc-antd-component-authoring/SKILL.md'),
    )).toBe(true);
  });

  test('refuses to overwrite an unrelated directory', () => {
    const project = createTemporaryProject();
    const unrelated = join(project, '.agents/skills/xc-antd');
    mkdirSync(unrelated, { recursive: true });
    writeFileSync(join(unrelated, 'SKILL.md'), 'name: another-skill\n');

    const result = runInstaller(project, '--force');

    expect(result.status).not.toBe(0);
    expect(readFileSync(join(unrelated, 'SKILL.md'), 'utf8'))
      .toBe('name: another-skill\n');
  });
});

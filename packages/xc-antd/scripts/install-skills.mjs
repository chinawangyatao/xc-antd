#!/usr/bin/env node

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(packageRoot, 'skills');
const consumerSkills = [
  'xc-antd',
  'xc-antd-image-upload',
  'xc-antd-rich-text-editor',
  'xc-antd-amap-editor',
];
const authoringSkill = 'xc-antd-component-authoring';

function printHelp() {
  console.log(`Install xc-antd Agent Skills into the current project.

Usage:
  xc-antd-skills install [--target <directory>] [--all] [--force]

Options:
  --target <directory>  Destination skill directory (default: .agents/skills)
  --all                 Also install the component-authoring skill
  --force               Replace an existing matching xc-antd skill
  --help                 Show this help
`);
}

function parseArguments(rawArguments) {
  const argumentsToParse = [...rawArguments];
  if (argumentsToParse[0] === 'install') argumentsToParse.shift();

  let target = '.agents/skills';
  let installAll = false;
  let force = false;

  for (let index = 0; index < argumentsToParse.length; index += 1) {
    const argument = argumentsToParse[index];
    if (argument === '--help' || argument === '-h') {
      return { help: true };
    }
    if (argument === '--all') {
      installAll = true;
      continue;
    }
    if (argument === '--force') {
      force = true;
      continue;
    }
    if (argument === '--target') {
      const value = argumentsToParse[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('--target requires a directory.');
      }
      target = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }

  return { force, help: false, installAll, target };
}

function isMatchingSkill(directory, skillName) {
  const skillFile = join(directory, 'SKILL.md');
  if (!existsSync(skillFile)) return false;
  const content = readFileSync(skillFile, 'utf8');
  return content.split(/\r?\n/).some((line) => line.trim() === `name: ${skillName}`);
}

function installSkills({ force, installAll, target }) {
  const targetRoot = resolve(process.cwd(), target);
  const skillNames = installAll
    ? [...consumerSkills, authoringSkill]
    : consumerSkills;

  for (const skillName of skillNames) {
    const source = join(sourceRoot, skillName);
    const destination = join(targetRoot, skillName);
    if (!existsSync(source)) {
      throw new Error(`Packaged skill is missing: ${source}`);
    }
    if (!existsSync(destination)) continue;
    if (!force) {
      throw new Error(
        `${destination} already exists. Re-run with --force to update it.`,
      );
    }
    if (!isMatchingSkill(destination, skillName)) {
      throw new Error(
        `Refusing to replace ${destination}: it is not a matching xc-antd skill.`,
      );
    }
  }

  mkdirSync(targetRoot, { recursive: true });
  for (const skillName of skillNames) {
    const source = join(sourceRoot, skillName);
    const destination = join(targetRoot, skillName);
    if (existsSync(destination)) rmSync(destination, { force: true, recursive: true });
    cpSync(source, destination, { recursive: true });
    console.log(`Installed ${skillName} -> ${destination}`);
  }
  console.log('Start a new AI Agent session to discover the installed skills.');
}

try {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printHelp();
  } else {
    installSkills(options);
  }
} catch (error) {
  console.error(`xc-antd-skills: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}

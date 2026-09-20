import { describe, expect, test } from 'bun:test';
import type { ReactElement } from 'react';
import {
  DEFAULT_RICH_TEXT_EDITOR_FORMATS,
  DEFAULT_RICH_TEXT_EDITOR_MODULES,
  READ_ONLY_RICH_TEXT_EDITOR_MODULES,
  resolveRichTextEditorModules,
} from '../src/RichTextEditor/config';
import { RichTextEditor } from '../src/RichTextEditor';

function getEditorElement(element: ReactElement) {
  const suspense = element.props.children as ReactElement;
  return suspense.props.children as ReactElement<Record<string, unknown>>;
}

describe('RichTextEditor', () => {
  test('resolves editable, read-only and custom Quill modules', () => {
    const customModules = { toolbar: [['bold']] };

    expect(resolveRichTextEditorModules(undefined, false))
      .toBe(DEFAULT_RICH_TEXT_EDITOR_MODULES);
    expect(resolveRichTextEditorModules(undefined, true))
      .toBe(READ_ONLY_RICH_TEXT_EDITOR_MODULES);
    expect(resolveRichTextEditorModules(customModules, true)).toBe(customModules);
    expect(DEFAULT_RICH_TEXT_EDITOR_FORMATS).toContain('image');
  });

  test('keeps controlled and uncontrolled values distinct', () => {
    const controlled = RichTextEditor({
      value: '<p>Controlled</p>',
      status: 'error',
      minHeight: 240,
    });
    const controlledEditor = getEditorElement(controlled);
    expect(controlled.props.className).toContain('xc-rich-text-editor--error');
    expect(controlled.props.style['--xc-rich-text-editor-min-height']).toBe('240px');
    expect(controlledEditor.props.value).toBe('<p>Controlled</p>');
    expect('defaultValue' in controlledEditor.props).toBe(false);

    const uncontrolled = RichTextEditor({ defaultValue: '<p>Initial</p>' });
    const uncontrolledEditor = getEditorElement(uncontrolled);
    expect(uncontrolledEditor.props.defaultValue).toBe('<p>Initial</p>');
    expect('value' in uncontrolledEditor.props).toBe(false);
  });

  test('maps disabled mode to a non-focusable read-only editor', () => {
    const element = RichTextEditor({ disabled: true });
    const editor = getEditorElement(element);

    expect(element.props.className).toContain('xc-rich-text-editor--disabled');
    expect(element.props['aria-disabled']).toBe(true);
    expect(editor.props.readOnly).toBe(true);
    expect(editor.props.tabIndex).toBe(-1);
    expect(editor.props.modules).toBe(READ_ONLY_RICH_TEXT_EDITOR_MODULES);
  });
});

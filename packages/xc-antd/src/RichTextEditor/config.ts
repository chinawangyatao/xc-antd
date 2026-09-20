import type { RichTextEditorModules } from './types';

export const DEFAULT_RICH_TEXT_EDITOR_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'code-block',
  'list',
  'indent',
  'align',
  'color',
  'background',
  'link',
  'image',
];

export const DEFAULT_RICH_TEXT_EDITOR_MODULES: RichTextEditorModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true,
  },
};

export const READ_ONLY_RICH_TEXT_EDITOR_MODULES: RichTextEditorModules = {
  toolbar: false,
};

export function resolveRichTextEditorModules(
  modules: RichTextEditorModules | undefined,
  readOnly: boolean,
) {
  if (modules) return modules;
  return readOnly
    ? READ_ONLY_RICH_TEXT_EDITOR_MODULES
    : DEFAULT_RICH_TEXT_EDITOR_MODULES;
}

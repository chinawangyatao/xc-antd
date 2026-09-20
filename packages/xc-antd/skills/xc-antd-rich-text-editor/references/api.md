# RichTextEditor API

Use `RichTextEditor` for HTML content such as announcements, product
descriptions, and operational copy.

```tsx
import { RichTextEditor } from 'xc-antd';
import 'xc-antd/style';

const [html, setHtml] = useState('<p>Initial content</p>');

<RichTextEditor
  value={html}
  onChange={setHtml}
  minHeight={240}
  placeholder="Enter content"
/>
```

## State and modes

- `value` and `onChange` provide controlled HTML state. Use `defaultValue` for uncontrolled initialization.
- `readOnly` renders the document without the default toolbar. `disabled` also prevents editing and applies a disabled field treatment.
- `status="error"` and `status="warning"` align validation borders with Ant Design fields.
- `minHeight` accepts a number in pixels or any CSS length.

## Quill customization

- The default toolbar covers headings, inline emphasis, lists, indentation,
  alignment, colors, quotes, code blocks, links, images, and format clearing.
- Pass `modules` and `formats` together when adding a Quill format not included
  by the default configuration.
- `editorProps` passes non-owned props such as `id`, `tabIndex`, `onFocus`,
  `onBlur`, and `useSemanticHTML`.

The value is HTML. The editor is not an HTML sanitizer. Sanitize untrusted
content at the server or rendering trust boundary before injecting it into
another page.

Source: `packages/xc-antd/src/RichTextEditor/`. Live example:
`/rich-text-editor`.

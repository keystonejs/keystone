import { VisuallyHidden } from '@westpac/a11y';

export const scope = { VisuallyHidden };

export const base = `<div>
  <h3>Default instance (no styling props)</h3>
  <VisuallyHidden>This is screen reader only text</VisuallyHidden>
</div>`;

export const code = `<div>
  <h3>VisuallyHidden with a <code>&lt;p&gt;</code> tag</h3>
  <VisuallyHidden tag="p">This is screen reader only text?</VisuallyHidden>
</div>`;

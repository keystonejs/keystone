/** @jsx jsx */

import dynamic from 'next/dynamic';

import { jsx, Stack, useTheme } from '@keystone-ui/core';

import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { FieldProps } from '@keystone-next/types';

// disable ssr for TinyMCE assets. also the 
const Editor = dynamic(async () => {
  // MUST IMPORT for TinyMCE to work!.
  await import('tinymce/tinymce');
  return import('@tinymce/tinymce-react').then(c => c.Editor);
}, { ssr: false });

const defaultOptions = {
  autoresize_bottom_margin: 20,
  base_url: '/tinymce-assets',
  branding: false,
  menubar: false,
  plugins: 'link lists code autoresize paste quickbars hr table emoticons image',
  statusbar: false,
  toolbar:
    'formatselect forecolor | alignleft aligncenter alignright alignjustify | bullist numlist indent outdent | link unlink | image table emoticons hr | code',
  quickbars_selection_toolbar:
    'bold italic underline strikethrough | h1 h2 h3 | quicklink blockquote removeformat',
  quickbars_insert_toolbar: false,
  width: '100%',
};


export function Field({
  autoFocus,
  field,
  value,
  onChange,
}: FieldProps<typeof import('.').controller>) {

  const handleChange = (value: string) => {
    if (typeof value === 'string') {
      onChange(value);
    }
  };

  const overrideOptions = field.editorConfig;
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {Editor && <Editor
        init={{ ...defaultOptions, auto_focus: autoFocus, ...overrideOptions }}
        onEditorChange={handleChange}
        value={value}
      // disabled={isDisabled}
      />}
      <style>
        {`
        .tox-tinymce {
          border-radius: 5px !important;
          border-color: #c1c7d0 !important;
        }
      `}
      </style>
    </FieldContainer>
  );
}

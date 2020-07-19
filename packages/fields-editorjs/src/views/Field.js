/** @jsx jsx */

import { jsx } from '@emotion/core';

import { FieldContainer, FieldLabel } from '@arch-ui/fields';
import { gridSize, colors, borderRadius } from '@arch-ui/theme';

// MUST IMPORT for TinyMCE to work!
// eslint-disable-next-line no-unused-vars
import EditorJs from 'react-editor-js';
import { EDITOR_JS_TOOLS } from './tools';


const EditorJsField = ({ onChange, autoFocus, field, errors, value: serverValue }) => {
  const handleChange = value => {
    onChange(value);
  };

  // const value = serverValue || {blocks:[]};
  const value = serverValue || { blocks: [] };
  const htmlID = `ks-input-${field.path}`;
  const accessError = errors.find(
    error => error instanceof Error && error.name === 'AccessDeniedError'
  );
  const data = {
    blocks: [
      {
        type: 'header',
        data: {
          text: 'Editor.js',
          level: 2,
        },
      },
      {
        type: 'paragraph',
        data: {
          text:
            'Hey. Meet the new Editor. On this page you can see it in action — try to edit this text. Source code of the page contains the example of connection and configuration.',
        },
      },
      {
        type: 'header',
        data: {
          text: 'Key features',
          level: 3,
        },
      },
      {
        type: 'list',
        data: {
          items: [
            'It is a block-styled editor',
            'It returns clean data output in JSON',
            'Designed to be extendable and pluggable with a simple API',
          ],
          style: 'unordered',
        },
      },
      {
        type: 'header',
        data: {
          text: 'What does it mean «block-styled editor»',
          level: 3,
        },
      },
      {
        type: 'paragraph',
        data: {
          text:
            'Workspace in classic editors is made of a single contenteditable element, used to create different HTML markups. Editor.js <mark class="cdx-marker">workspace consists of separate Blocks: paragraphs, headings, images, lists, quotes, etc</mark>. Each of them is an independent contenteditable element (or more complex structure) provided by Plugin and united by Editor\'s Core.',
        },
      },
      {
        type: 'paragraph',
        data: {
          text: `There are dozens of <a href="https://github.com/editor-js">ready-to-use Blocks</a> and the <a href="https://editorjs.io/creating-a-block-tool">simple API</a> for creation any Block you need. For example, you can implement Blocks for Tweets, Instagram posts, surveys and polls, CTA-buttons and even games.`,
        },
      },
      {
        type: 'header',
        data: {
          text: 'What does it mean clean data output',
          level: 3,
        },
      },
      {
        type: 'paragraph',
        data: {
          text:
            'Classic WYSIWYG-editors produce raw HTML-markup with both content data and content appearance. On the contrary, Editor.js outputs JSON object with data of each Block. You can see an example below',
        },
      },
      {
        type: 'paragraph',
        data: {
          text: `Given data can be used as you want: render with HTML for <code class="inline-code">Web clients</code>, render natively for <code class="inline-code">mobile apps</code>, create markup for <code class="inline-code">Facebook Instant Articles</code> or <code class="inline-code">Google AMP</code>, generate an <code class="inline-code">audio version</code> and so on.`,
        },
      },
      {
        type: 'paragraph',
        data: {
          text: 'Clean data is useful to sanitize, validate and process on the backend.',
        },
      },
      {
        type: 'delimiter',
        data: {},
      },
      {
        type: 'paragraph',
        data: {
          text:
            'We have been working on this project more than three years. Several large media projects help us to test and debug the Editor, to make its core more stable. At the same time we significantly improved the API. Now, it can be used to create any plugin for any task. Hope you enjoy. 😏',
        },
      },
      {
        type: 'image',
        data: {
          url: 'assets/codex2x.png',
          caption: '',
          stretched: false,
          withBorder: true,
          withBackground: false,
        },
      },
    ],
  };
  if (accessError) return null;

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      {/* <GlobalStyles /> */}
      <div
        css={{
          border: `1px ${colors.N20} solid`,
          borderRadius,
          padding: `${gridSize}px`,
        }}
      >

        <EditorJs
          data={value}
          tools={EDITOR_JS_TOOLS}
          onChange={async e => {
            console.log('editorjs onchange');
            console.log(e);
            handleChange(await e.saver.save());
          }}
          css={{
            display: 'flex',
            padding: `${gridSize}px 0`,
            borderBottom: `1px solid ${colors.N10}`,
            marginBottom: `${gridSize}px`,
          }}
        />
      </div>
    </FieldContainer>
  );
};

export default EditorJsField;

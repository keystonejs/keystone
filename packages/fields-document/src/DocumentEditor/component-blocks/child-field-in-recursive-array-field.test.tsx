/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import React, { ReactElement } from 'react';
import { jsx, makeEditor } from '../tests/utils';
import { component, fields } from '../../component-blocks';
import { ArrayField, ChildField, ObjectField, PreviewProps } from './api';

type ListItems = ArrayField<
  ObjectField<{
    content: ChildField;
    children: ListItems;
  }>
>;

const children: ListItems = fields.array(
  fields.object({
    content: fields.child({ kind: 'inline', placeholder: '' }),
    get children() {
      return children;
    },
  })
);

function List(props: PreviewProps<ListItems>): ReactElement {
  return React.createElement(
    'ul',
    null,
    props.elements.map(x => {
      return React.createElement(
        'li',
        { key: x.id },
        x.element.fields.content,
        React.createElement(List, x.element.fields.children)
      );
    }),
    React.createElement('button', { onClick: () => props.onInsert() }, 'Insert')
  );
}

const list = component({
  component: props => React.createElement(List, props.fields.children),
  label: '',
  props: {
    children,
  },
});

test('recursive arrays of child fields existing does not crash and are not normalized away', () => {
  makeEditor(
    <editor>
      <component-block
        component="list"
        props={{
          children: [
            { content: null, children: [] },
            {
              content: null,
              children: [
                {
                  content: null,
                  children: [
                    { content: null, children: [] },
                    { content: null, children: [] },
                    { content: null, children: [] },
                  ],
                },
              ],
            },
            {
              content: null,
              children: [
                { content: null, children: [] },
                { content: null, children: [] },
              ],
            },
          ],
        }}
      >
        <component-inline-prop propPath={['children', 0, 'content']}>
          <text>first</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'content']}>
          <text>second</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'children', 0, 'content']}>
          <text>first in second</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'children', 0, 'children', 0, 'content']}>
          <text>first in first in second</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'children', 0, 'children', 1, 'content']}>
          <text>second in first in second</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 1, 'children', 0, 'children', 2, 'content']}>
          <text>third in first in second</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 2, 'content']}>
          <text>third</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 2, 'children', 0, 'content']}>
          <text>first in third</text>
        </component-inline-prop>
        <component-inline-prop propPath={['children', 2, 'children', 1, 'content']}>
          <text>second in third</text>
        </component-inline-prop>
      </component-block>
      <paragraph>
        <text />
      </paragraph>
    </editor>,
    { componentBlocks: { list } }
  );
});

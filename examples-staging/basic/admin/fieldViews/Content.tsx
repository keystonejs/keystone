/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { InfoIcon } from '@keystone-ui/icons/icons/InfoIcon';
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon';
import { AlertOctagonIcon } from '@keystone-ui/icons/icons/AlertOctagonIcon';
import { CheckCircleIcon } from '@keystone-ui/icons/icons/CheckCircleIcon';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { Tooltip } from '@keystone-ui/tooltip';
import { component, fields, NotEditable } from '@keystone-6/fields-document/component-blocks';
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from '@keystone-6/fields-document/primitives';
import { useEffect } from 'react';
import { Button } from '@keystone-ui/button';

const noticeIconMap = {
  info: InfoIcon,
  error: AlertOctagonIcon,
  warning: AlertTriangleIcon,
  success: CheckCircleIcon,
};

export const componentBlocks = {
  table: component({
    component: function MyTable(props) {
      useEffect(() => {
        let maxColumns = 1;
        const rows = props.fields.rows;
        for (const row of rows.elements) {
          if (row.element.elements.length > maxColumns) {
            maxColumns = row.element.elements.length;
          }
        }
        if (rows.elements.some(x => x.element.elements.length !== maxColumns)) {
          rows.onChange(
            rows.elements.map(element => {
              return {
                key: element.key,
                value: [
                  ...element.element.elements,
                  ...Array.from({ length: maxColumns - element.element.elements.length }, () => ({
                    key: undefined,
                  })),
                ],
              };
            })
          );
        }
      });

      return (
        <div>
          <table css={{ width: '100%' }}>
            <tbody>
              {props.fields.rows.elements.map((row, i) => {
                return (
                  <tr key={i} css={{ border: '1px solid black' }}>
                    {row.element.elements.map((column, i) => {
                      return (
                        <td key={i} css={{ border: '1px solid black' }}>
                          {column.element.fields.content.element}
                        </td>
                      );
                    })}
                    <NotEditable>
                      <Button
                        onClick={() => {
                          props.fields.rows.onChange(
                            props.fields.rows.elements.map(element => {
                              return {
                                key: element.key,
                                value: [...element.element.elements, { key: undefined }],
                              };
                            })
                          );
                        }}
                      >
                        Insert Column
                      </Button>
                    </NotEditable>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <NotEditable>
            <div
              onClick={() => {
                props.fields.rows.onChange([...props.fields.rows.elements, { key: undefined }]);
              }}
            >
              <Button>Insert row</Button>
            </div>
          </NotEditable>
        </div>
      );
    },
    label: 'Table',
    props: {
      rows: fields.array(
        fields.array(
          fields.object({
            content: fields.child({ kind: 'block', placeholder: '' }),
          })
        )
      ),
      headers: fields.object({
        row: fields.checkbox({ label: 'Header Row' }),
        column: fields.checkbox({ label: 'Header Column' }),
      }),
    },
  }),
  myList: component({
    component: function MyList(props) {
      useEffect(() => {
        if (!props.fields.children.elements.length) {
          props.fields.children.onChange([...props.fields.children.elements, { key: undefined }]);
        }
      });
      return (
        <ul css={{ padding: 0 }}>
          {props.fields.children.elements.map(element => (
            <li css={{ listStyle: 'none' }} key={element.key}>
              <input
                contentEditable="false"
                css={{ marginRight: 8 }}
                type="checkbox"
                checked={element.element.fields.done.value}
                onChange={event => element.element.fields.done.onChange(event.target.checked)}
              />
              <span
                style={{
                  textDecoration: element.element.fields.done.value ? 'line-through' : undefined,
                }}
              >
                {element.element.fields.content.element}
              </span>
            </li>
          ))}
        </ul>
      );
    },
    label: 'My List',
    props: {
      children: fields.array(
        fields.object({
          done: fields.checkbox({ label: 'Done' }),
          content: fields.child({ kind: 'inline', placeholder: '', formatting: 'inherit' }),
        })
      ),
    },
    // chromeless: true,
  }),
  hero: component({
    component: props => {
      return (
        <div
          css={{
            backgroundColor: 'white',
            backgroundImage: `url(${props.fields.imageSrc.value})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            display: 'flex',
            flexDirection: 'column',
            fontSize: 28,
            justifyContent: 'space-between',
            minHeight: 200,
            padding: 16,
            width: '100%',
          }}
        >
          <div
            css={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: 48,
              textAlign: 'center',
              margin: 16,
              textShadow: '0px 1px 3px black',
            }}
          >
            {props.fields.title.element}
          </div>
          <div
            css={{
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              margin: 16,
              textAlign: 'center',
              textShadow: '0px 1px 3px black',
            }}
          >
            {props.fields.content.element}
          </div>
          {props.fields.cta.discriminant ? (
            <div
              css={{
                backgroundColor: '#F9BF12',
                borderRadius: 6,
                color: '#002B55',
                display: 'inline-block',
                fontSize: 16,
                fontWeight: 'bold',
                margin: '16px auto',
                padding: '12px 16px',
              }}
            >
              {props.fields.cta.value.fields.text.element}
            </div>
          ) : null}
        </div>
      );
    },
    label: 'Hero',
    props: {
      title: fields.child({ kind: 'inline', placeholder: 'Title...' }),
      content: fields.child({ kind: 'block', placeholder: '...' }),
      imageSrc: fields.text({
        label: 'Image URL',
        defaultValue: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
      }),
      cta: fields.conditional(fields.checkbox({ label: 'Show CTA' }), {
        false: fields.empty(),
        true: fields.object({
          text: fields.child({ kind: 'inline', placeholder: 'CTA...' }),
          href: fields.url({ label: 'Call to action link' }),
        }),
      }),
    },
  }),
  void: component({
    label: 'Void',
    component: props => <NotEditable>{props.fields.value.value}</NotEditable>,
    props: { value: fields.text({ label: 'Value' }) },
  }),
  conditionallyVoid: component({
    label: 'Conditionally Void',
    component: props =>
      props.fields.something.discriminant ? (
        <NotEditable>Is void</NotEditable>
      ) : (
        <div>{props.fields.something.value.element}</div>
      ),
    props: {
      something: fields.conditional(fields.checkbox({ label: 'Is void' }), {
        false: fields.child({ kind: 'inline', placeholder: '...' }),
        true: fields.empty(),
      }),
    },
  }),
  featuredAuthors: component({
    label: 'Featured Authors',
    component: props => {
      return (
        <div>
          <h1>{props.fields.title.element}</h1>
          <NotEditable>
            <ul>
              {props.fields.authors.value.map((author, i) => {
                return (
                  <li key={i}>
                    {author.label}
                    <ul>
                      {author.data.posts.map((post: { title: string | null }, i: number) => {
                        return <li key={i}>{post.title}</li>;
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </NotEditable>
        </div>
      );
    },
    props: {
      title: fields.child({ kind: 'inline', placeholder: 'Title...' }),
      authors: fields.relationship({
        label: 'Authors',
        listKey: 'User',
        many: true,
        selection: `posts(take: 10) { title }`,
      }),
    },
  }),
  notice: component({
    component: function Notice(props) {
      const { palette, radii, spacing } = useTheme();
      const intentMap = {
        info: {
          background: palette.blue100,
          foreground: palette.blue700,
          icon: noticeIconMap.info,
        },
        error: {
          background: palette.red100,
          foreground: palette.red700,
          icon: noticeIconMap.error,
        },
        warning: {
          background: palette.yellow100,
          foreground: palette.yellow700,
          icon: noticeIconMap.warning,
        },
        success: {
          background: palette.green100,
          foreground: palette.green700,
          icon: noticeIconMap.success,
        },
      };
      const intentConfig = intentMap[props.fields.intent.value];

      return (
        <div
          css={{
            borderRadius: radii.small,
            display: 'flex',
            paddingLeft: spacing.medium,
            paddingRight: spacing.medium,
          }}
          style={{
            background: intentConfig.background,
          }}
        >
          <NotEditable>
            <div
              css={{
                color: intentConfig.foreground,
                marginRight: spacing.small,
                marginTop: '1em',
              }}
            >
              <intentConfig.icon />
            </div>
          </NotEditable>
          <div css={{ flex: 1 }}>{props.fields.content.element}</div>
        </div>
      );
    },
    label: 'Notice',
    chromeless: true,
    props: {
      intent: fields.select({
        label: 'Intent',
        options: [
          { value: 'info', label: 'Info' },
          { value: 'warning', label: 'Warning' },
          { value: 'error', label: 'Error' },
          { value: 'success', label: 'Success' },
        ] as const,
        defaultValue: 'info',
      }),
      content: fields.child({
        kind: 'block',
        placeholder: '',
        formatting: 'inherit',
        dividers: 'inherit',
        links: 'inherit',
        relationships: 'inherit',
      }),
    },
    toolbar({ props, onRemove }) {
      return (
        <ToolbarGroup>
          {props.intent.options.map(opt => {
            const Icon = noticeIconMap[opt.value];

            return (
              <Tooltip key={opt.value} content={opt.label} weight="subtle">
                {attrs => (
                  <ToolbarButton
                    isSelected={props.intent.value === opt.value}
                    onClick={() => {
                      props.intent.onChange(opt.value);
                    }}
                    {...attrs}
                  >
                    <Icon size="small" />
                  </ToolbarButton>
                )}
              </Tooltip>
            );
          })}

          <ToolbarSeparator />

          <Tooltip content="Remove" weight="subtle">
            {attrs => (
              <ToolbarButton variant="destructive" onClick={onRemove} {...attrs}>
                <Trash2Icon size="small" />
              </ToolbarButton>
            )}
          </Tooltip>
        </ToolbarGroup>
      );
    },
  }),
  quote: component({
    component: props => {
      return (
        <div
          css={{
            paddingLeft: 16,
            backgroundColor: '#f3f5f6',
            padding: '4px 12px 16px 48px',
            position: 'relative',
            borderRadius: 6,
            ':after': {
              content: '"\\201C"',
              position: 'absolute',
              top: 0,
              left: 16,
              fontSize: '4rem',
            },
          }}
        >
          <div css={{ fontStyle: 'italic', color: '#4A5568' }}>{props.fields.content.element}</div>
          <div css={{ fontWeight: 'bold', color: '#47546b' }}>
            <NotEditable>— </NotEditable>
            {props.fields.attribution.element}
          </div>
        </div>
      );
    },
    label: 'Quote',
    props: {
      content: fields.child({
        kind: 'block',
        placeholder: 'Quote...',
        formatting: { inlineMarks: 'inherit', softBreaks: 'inherit', alignment: 'inherit' },
        links: 'inherit',
      }),
      attribution: fields.child({ kind: 'inline', placeholder: 'Attribution...' }),
    },
    chromeless: true,
  }),
};

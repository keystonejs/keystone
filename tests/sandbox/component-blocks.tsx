/** @jsxRuntime classic */
/** @jsx jsx */

import { Box, jsx, useTheme } from '@keystone-ui/core'
import { InfoIcon } from '@keystone-ui/icons/icons/InfoIcon'
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon'
import { AlertOctagonIcon } from '@keystone-ui/icons/icons/AlertOctagonIcon'
import { CheckCircleIcon } from '@keystone-ui/icons/icons/CheckCircleIcon'
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon'
import { Tooltip } from '@keystone-ui/tooltip'
import { component, fields, NotEditable } from '@keystone-6/fields-document/component-blocks'
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from '@keystone-6/fields-document/primitives'
import { useEffect } from 'react'
import { Button } from '@keystone-ui/button'

const noticeIconMap = {
  info: InfoIcon,
  error: AlertOctagonIcon,
  warning: AlertTriangleIcon,
  success: CheckCircleIcon,
}

export const componentBlocks = {
  carousel: component({
    label: 'Carousel',
    preview: props => {
      return (
        <NotEditable>
          <div
            css={{
              overflowY: 'scroll',
              display: 'flex',
              scrollSnapType: 'y mandatory',
            }}
          >
            {props.fields.items.elements.map(item => {
              return (
                <Box
                  margin="xsmall"
                  css={{
                    minWidth: '61.8%',
                    scrollSnapAlign: 'center',
                    scrollSnapStop: 'always',
                    margin: 4,
                    padding: 8,
                    boxSizing: 'border-box',
                    borderRadius: 6,
                    background: '#eff3f6',
                  }}
                >
                  <img
                    role="presentation"
                    src={item.fields.image.value}
                    css={{
                      objectFit: 'cover',
                      objectPosition: 'center center',
                      height: 240,
                      width: '100%',
                      borderRadius: 4,
                    }}
                  />
                  <h1
                    css={{
                      '&&': {
                        fontSize: '1.25rem',
                        lineHeight: 'unset',
                        marginTop: 8,
                      },
                    }}
                  >
                    {item.fields.title.value}
                  </h1>
                </Box>
              )
            })}
          </div>
        </NotEditable>
      )
    },
    schema: {
      items: fields.array(
        fields.object({
          title: fields.text({ label: 'Title' }),
          image: fields.url({
            label: 'Image URL',
            defaultValue: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
          }),
        })
      ),
    },
  }),
  questionsAndAnswers: component({
    label: 'Questions & Answers',
    schema: {
      questions: fields.array(
        fields.object({
          question: fields.child({ placeholder: 'Question', kind: 'inline' }),
          answer: fields.child({ placeholder: 'Answer', formatting: 'inherit', kind: 'block' }),
        })
      ),
    },
    preview: props => {
      return (
        <div>
          {props.fields.questions.elements.map(questionAndAnswer => {
            return (
              <div key={questionAndAnswer.key}>
                <h2>{questionAndAnswer.fields.question.element}</h2>
                <p>{questionAndAnswer.fields.answer.element}</p>
                <NotEditable>
                  <Button
                    onClick={() => {
                      props.fields.questions.onChange(
                        props.fields.questions.elements
                          .filter(x => x.key !== questionAndAnswer.key)
                          .map(x => ({ key: x.key }))
                      )
                    }}
                  >
                    Remove
                  </Button>
                </NotEditable>
              </div>
            )
          })}
          <NotEditable>
            <Button
              onClick={() => {
                props.fields.questions.onChange([
                  ...props.fields.questions.elements,
                  { key: undefined },
                ])
              }}
            >
              Insert
            </Button>
          </NotEditable>
        </div>
      )
    },
  }),
  table: component({
    preview: function MyTable (props) {
      useEffect(() => {
        let maxColumns = 1
        const rows = props.fields.rows
        for (const row of rows.elements) {
          if (row.elements.length > maxColumns) {
            maxColumns = row.elements.length
          }
        }
        if (rows.elements.some(x => x.elements.length !== maxColumns)) {
          rows.onChange(
            rows.elements.map(element => {
              return {
                key: element.key,
                value: [
                  ...element.elements.map(x => ({ key: x.key })),
                  ...Array.from({ length: maxColumns - element.elements.length }, () => ({
                    key: undefined,
                  })),
                ],
              }
            })
          )
        }
      })

      return (
        <div>
          <table css={{ width: '100%' }}>
            <tbody>
              {props.fields.rows.elements.map((row, i) => {
                return (
                  <tr key={i} css={{ border: '1px solid black' }}>
                    {row.elements.map((column, i) => {
                      return (
                        <td key={i} css={{ border: '1px solid black' }}>
                          {column.fields.content.element}
                        </td>
                      )
                    })}
                    <NotEditable>
                      <Button
                        onClick={() => {
                          props.fields.rows.onChange(
                            props.fields.rows.elements.map(element => {
                              return {
                                key: element.key,
                                value: [
                                  ...element.elements.map(x => ({ key: x.key })),
                                  { key: undefined },
                                ],
                              }
                            })
                          )
                        }}
                      >
                        Insert Column
                      </Button>
                    </NotEditable>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <NotEditable>
            <div
              onClick={() => {
                props.fields.rows.onChange([
                  ...props.fields.rows.elements.map(x => ({ key: x.key })),
                  { key: undefined },
                ])
              }}
            >
              <Button>Insert row</Button>
            </div>
          </NotEditable>
        </div>
      )
    },
    label: 'Table',
    schema: {
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
  checkboxList: component({
    preview: function CheckboxList (props) {
      useEffect(() => {
        if (!props.fields.children.elements.length) {
          props.fields.children.onChange([{ key: undefined }])
        }
      })
      return (
        <ul css={{ padding: 0 }}>
          {props.fields.children.elements.map(element => (
            <li css={{ listStyle: 'none' }} key={element.key}>
              <input
                contentEditable="false"
                css={{ marginRight: 8 }}
                type="checkbox"
                checked={element.fields.done.value}
                onChange={event => element.fields.done.onChange(event.target.checked)}
              />
              <span
                style={{
                  textDecoration: element.fields.done.value ? 'line-through' : undefined,
                }}
              >
                {element.fields.content.element}
              </span>
            </li>
          ))}
        </ul>
      )
    },
    label: 'Checkbox List',
    schema: {
      children: fields.array(
        fields.object({
          done: fields.checkbox({ label: 'Done' }),
          content: fields.child({ kind: 'inline', placeholder: '', formatting: 'inherit' }),
        })
      ),
    },
    chromeless: true,
  }),
  hero: component({
    preview: props => {
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
      )
    },
    label: 'Hero',
    schema: {
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
    preview: props => <NotEditable>{props.fields.value.value}</NotEditable>,
    schema: { value: fields.text({ label: 'Value' }) },
  }),
  conditionallyVoid: component({
    label: 'Conditionally Void',
    preview: props =>
      props.fields.something.discriminant ? (
        <NotEditable>Is void</NotEditable>
      ) : (
        <div>{props.fields.something.value.element}</div>
      ),
    schema: {
      something: fields.conditional(fields.checkbox({ label: 'Is void' }), {
        false: fields.child({ kind: 'inline', placeholder: '...' }),
        true: fields.empty(),
      }),
    },
  }),
  featuredAuthors: component({
    label: 'Featured Authors',
    preview: props => {
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
                        return <li key={i}>{post.title}</li>
                      })}
                    </ul>
                  </li>
                )
              })}
            </ul>
          </NotEditable>
        </div>
      )
    },
    schema: {
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
    preview: function Notice (props) {
      const { palette, radii, spacing } = useTheme()
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
      }
      const intentConfig = intentMap[props.fields.intent.value]

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
      )
    },
    label: 'Notice',
    chromeless: true,
    schema: {
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
    toolbar ({ props, onRemove }) {
      return (
        <ToolbarGroup>
          {props.fields.intent.options.map(opt => {
            const Icon = noticeIconMap[opt.value]

            return (
              <Tooltip key={opt.value} content={opt.label} weight="subtle">
                {attrs => (
                  <ToolbarButton
                    isSelected={props.fields.intent.value === opt.value}
                    onMouseDown={event => {
                      event.preventDefault()
                      props.fields.intent.onChange(opt.value)
                    }}
                    {...attrs}
                  >
                    <Icon size="small" />
                  </ToolbarButton>
                )}
              </Tooltip>
            )
          })}

          <ToolbarSeparator />

          <Tooltip content="Remove" weight="subtle">
            {attrs => (
              <ToolbarButton
                variant="destructive"
                onMouseDown={event => {
                  event.preventDefault()
                  onRemove()
                }}
                {...attrs}
              >
                <Trash2Icon size="small" />
              </ToolbarButton>
            )}
          </Tooltip>
        </ToolbarGroup>
      )
    },
  }),
  quote: component({
    preview: props => {
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
      )
    },
    label: 'Quote',
    schema: {
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
  addingFieldsLater: component({
    preview: () => null,
    label: 'Adding Fields Later',
    schema: {
      someText: fields.text({ label: 'Some text' }),
      // try
      // 1. creating a document with this component blocks
      // 2. uncommenting the lines below
      // 3. view the document again and see if the fields are there
      // someObject: fields.object({
      //   someTextAddedLater: fields.text({ label: 'Some text added later' }),
      // }),
    },
  }),
}

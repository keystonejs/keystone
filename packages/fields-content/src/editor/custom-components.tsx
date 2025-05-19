import { Button } from '@keystar/ui/button'
import { DialogContainer, Dialog } from '@keystar/ui/dialog'
import { Box, Flex } from '@keystar/ui/layout'
import { Heading } from '@keystar/ui/typography'
import type { MarkSpec, Node } from 'prosemirror-model'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { FormValue } from './FormValue'
import { insertNode } from './commands/misc'
import { useEditorDispatchCommand } from './editor-view'
import type { EditorNodeSpec } from './schema'
import { classes } from './utils'
import { NodeSelection } from 'prosemirror-state'
import { css, tokenSchema } from '@keystar/ui/style'
import { Item, Menu, MenuTrigger } from '@keystar/ui/menu'
import { deserializeValue, toSerialized, useDeserializedValue } from './props-serialization'
import type { ContentComponent } from '../content-components'
import { getInitialPropsValue } from '../form/initial-values'

function serializeProps(props: { value: unknown }) {
  return JSON.stringify(props.value)
}

function deserializeProps(node: HTMLElement | string): { props: unknown } | false {
  if (typeof node === 'string') return false
  const serialized = node.dataset.props
  if (!serialized) return false
  try {
    const parsed = JSON.parse(serialized)
    return { props: parsed.value }
  } catch {
    return false
  }
}

function BlockWrapper(props: {
  node: Node
  hasNodeSelection: boolean
  component: ContentComponent
  children: ReactNode
  getPos: () => number | undefined
  toolbar?: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const runCommand = useEditorDispatchCommand()
  const schema = useMemo(
    () => ({ kind: 'object' as const, fields: props.component.schema }),
    [props.component.schema]
  )

  const value = useDeserializedValue(props.node.attrs.props, props.component.schema)
  return (
    <>
      <Box
        UNSAFE_className={`${classes.blockParent} ${css({
          marginBlock: '1em',
          position: 'relative',
          ...(props.hasNodeSelection
            ? {
                '&::after': {
                  backgroundColor: tokenSchema.color.alias.backgroundSelected,
                  borderRadius: tokenSchema.size.radius.regular,
                  content: "''",
                  inset: 0,
                  pointerEvents: 'none',
                  position: 'absolute',
                },
              }
            : {}),
        })}${props.hasNodeSelection ? ` ${classes.hideselection}` : ''}`}
        border={
          props.hasNodeSelection ? 'color.alias.borderSelected' : 'color.alias.borderDisabled'
        }
        borderRadius="regular"
      >
        <Flex
          backgroundColor={
            props.hasNodeSelection ? 'color.alias.backgroundSelected' : 'color.alias.backgroundIdle'
          }
          contentEditable={false}
          alignItems="center"
          data-ignore-content=""
        >
          <Box
            flex={1}
            paddingX="regular"
            paddingY="small"
            UNSAFE_className={css({
              color: props.hasNodeSelection
                ? tokenSchema.color.foreground.accent
                : tokenSchema.color.foreground.neutralTertiary,
              textTransform: 'uppercase',
              fontWeight: tokenSchema.typography.fontWeight.semibold,
              fontSize: '0.9rem',
            })}
            // this onClick is on a div because it's purely for mouse usage
            // the node can be selected with a keyboard via arrow keys
            onClick={() => {
              runCommand((state, dispatch) => {
                if (dispatch) {
                  dispatch(state.tr.setSelection(NodeSelection.create(state.doc, props.getPos()!)))
                }
                return true
              })
            }}
          >
            {props.component.label}
          </Box>
          {props.toolbar}
          {!!Object.keys(props.component.schema).length && (
            <Button
              prominence="low"
              onPress={() => {
                setIsOpen(true)
              }}
              UNSAFE_className={css({
                borderBottomRightRadius: 0,
              })}
            >
              Edit
            </Button>
          )}
        </Flex>
        <Box padding="regular">{props.children}</Box>
      </Box>
      <DialogContainer
        onDismiss={() => {
          setIsOpen(false)
        }}
      >
        {isOpen && (
          <Dialog>
            <Heading>Edit {props.component.label}</Heading>
            <FormValue
              schema={schema}
              value={value}
              onSave={value => {
                runCommand((state, dispatch) => {
                  if (dispatch) {
                    dispatch(
                      state.tr.setNodeAttribute(
                        props.getPos()!,
                        'props',
                        toSerialized(value, schema.fields)
                      )
                    )
                  }
                  return true
                })
              }}
            />
          </Dialog>
        )}
      </DialogContainer>
    </>
  )
}

export function getCustomNodeSpecs(components: Record<string, ContentComponent>) {
  const componentNames = new Map(Object.keys(components).map((name, i) => [name, `component${i}`]))
  return Object.fromEntries(
    Object.entries(components).flatMap(([name, component]) => {
      let spec: EditorNodeSpec | undefined
      const schema = {
        kind: 'object' as const,
        fields: component.schema,
      }
      if (component.kind === 'block') {
        spec = {
          group: `${component.forSpecificLocations ? '' : 'block '}${componentNames.get(name)}`,
          defining: true,
          attrs: {
            props: {
              default: toSerialized(getInitialPropsValue(schema), schema.fields),
            },
          },
          reactNodeView: {
            component: function Block(props) {
              const runCommand = useEditorDispatchCommand()
              const value = useDeserializedValue(props.node.attrs.props, component.schema)
              return 'NodeView' in component && component.NodeView ? (
                <component.NodeView
                  isSelected={props.hasNodeSelection || props.isNodeCompletelyWithinSelection}
                  onRemove={() => {
                    runCommand((state, dispatch) => {
                      if (dispatch) {
                        const pos = props.getPos()!
                        dispatch(state.tr.delete(pos, pos + props.node.nodeSize))
                      }
                      return true
                    })
                  }}
                  onChange={value => {
                    runCommand((state, dispatch) => {
                      if (dispatch) {
                        dispatch(
                          state.tr.setNodeAttribute(
                            props.getPos()!,
                            'props',
                            toSerialized(value, schema.fields)
                          )
                        )
                      }
                      return true
                    })
                  }}
                  value={value}
                />
              ) : (
                <BlockWrapper
                  node={props.node}
                  hasNodeSelection={props.hasNodeSelection || props.isNodeCompletelyWithinSelection}
                  component={component}
                  getPos={props.getPos}
                >
                  {'ContentView' in component && component.ContentView && (
                    <component.ContentView value={value} />
                  )}
                </BlockWrapper>
              )
            },
            rendersOwnContent: false,
          },
          parseDOM: [
            {
              tag: `div[data-component="${name}"]`,
              getAttrs(node) {
                if (typeof node === 'string') return false
                return deserializeProps(node)
              },
            },
          ],
          toDOM(node) {
            return [
              'div',
              {
                'data-component': name,
                'data-props': serializeProps(node.attrs.props),
              },
            ]
          },
          insertMenu: component.forSpecificLocations
            ? undefined
            : {
                label: component.label,
                command: insertNode,
                forToolbar: true,
                description: component.description,
                icon: component.icon,
              },
        }
      } else if (component.kind === 'wrapper') {
        spec = {
          group: `${component.forSpecificLocations ? '' : 'block '}${componentNames.get(name)}`,
          content: 'block+',
          defining: true,
          attrs: {
            props: {
              default: toSerialized(getInitialPropsValue(schema), schema.fields),
            },
          },
          reactNodeView: {
            component: function Block(props) {
              const runCommand = useEditorDispatchCommand()
              const value = useDeserializedValue(props.node.attrs.props, component.schema)
              return 'NodeView' in component && component.NodeView ? (
                <component.NodeView
                  isSelected={props.hasNodeSelection || props.isNodeCompletelyWithinSelection}
                  onRemove={() => {
                    runCommand((state, dispatch) => {
                      if (dispatch) {
                        const pos = props.getPos()!
                        dispatch(state.tr.delete(pos, pos + props.node.nodeSize))
                      }
                      return true
                    })
                  }}
                  onChange={value => {
                    runCommand((state, dispatch) => {
                      if (dispatch) {
                        dispatch(
                          state.tr.setNodeAttribute(
                            props.getPos()!,
                            'props',
                            toSerialized(value, schema.fields)
                          )
                        )
                      }
                      return true
                    })
                  }}
                  value={value}
                >
                  {props.children}
                </component.NodeView>
              ) : (
                <BlockWrapper
                  node={props.node}
                  hasNodeSelection={props.hasNodeSelection || props.isNodeCompletelyWithinSelection}
                  component={component}
                  getPos={props.getPos}
                >
                  {'ContentView' in component && component.ContentView ? (
                    <component.ContentView value={value}>{props.children}</component.ContentView>
                  ) : (
                    props.children
                  )}
                </BlockWrapper>
              )
            },
            rendersOwnContent: false,
          },
          toDOM(node) {
            return [
              'div',
              {
                'data-component': name,
                'data-props': serializeProps(node.attrs.props),
              },
              0,
            ]
          },
          parseDOM: [
            {
              tag: `div[data-component="${name}"]`,
              getAttrs: deserializeProps,
            },
          ],
          insertMenu: component.forSpecificLocations
            ? undefined
            : {
                label: component.label,
                command: insertNode,
                forToolbar: true,
                description: component.description,
                icon: component.icon,
              },
        }
      } else if (component.kind === 'inline') {
        spec = {
          group: 'inline',
          inline: true,
          attrs: {
            props: {
              default: toSerialized(getInitialPropsValue(schema), schema.fields),
            },
          },
          toDOM: node => [
            'span',
            {
              'data-component': name,
              'data-props': serializeProps(node.attrs.props),
            },
          ],
          parseDOM: [
            {
              tag: `span[data-component="${name}"]`,
              getAttrs: deserializeProps,
            },
          ],
          reactNodeView: {
            component: function Inline(props) {
              const value = useDeserializedValue(props.node.attrs.props, component.schema)
              const runCommand = useEditorDispatchCommand()
              if ('NodeView' in component && component.NodeView) {
                return (
                  <span contentEditable={false}>
                    <component.NodeView
                      value={value}
                      onChange={value => {
                        runCommand((state, dispatch) => {
                          if (dispatch) {
                            dispatch(
                              state.tr.setNodeAttribute(
                                props.getPos()!,
                                'props',
                                toSerialized(value, schema.fields)
                              )
                            )
                          }
                          return true
                        })
                      }}
                      isSelected={props.hasNodeSelection || props.isNodeCompletelyWithinSelection}
                      onRemove={() => {
                        runCommand((state, dispatch) => {
                          if (dispatch) {
                            const pos = props.getPos()!
                            dispatch(state.tr.delete(pos, pos + props.node.nodeSize))
                          }
                          return true
                        })
                      }}
                    />
                  </span>
                )
              }
              if ('ContentView' in component && component.ContentView) {
                return (
                  <Box
                    elementType="span"
                    contentEditable={false}
                    border={
                      props.hasNodeSelection
                        ? 'color.alias.borderSelected'
                        : 'color.alias.borderIdle'
                    }
                    borderRadius="regular"
                  >
                    <component.ContentView value={value} />
                  </Box>
                )
              }
              return (
                <Box
                  elementType="span"
                  contentEditable={false}
                  border={
                    props.hasNodeSelection ? 'color.alias.borderSelected' : 'color.alias.borderIdle'
                  }
                  data-component={name}
                  borderRadius="regular"
                  UNSAFE_className={css({
                    '::after': {
                      content: 'attr(data-component)',
                    },
                  })}
                />
              )
            },
            rendersOwnContent: false,
          },
          insertMenu: {
            label: component.label,
            command: insertNode,
            forToolbar: true,
            description: component.description,
            icon: component.icon,
          },
        }
      } else if (component.kind === 'repeating') {
        const items = component.children.map(x => ({
          key: x,
          label: components[x].label,
        }))
        spec = {
          group: `${component.forSpecificLocations ? '' : 'block '}${componentNames.get(name)}`,
          content: `(${component.children
            .map(x => componentNames.get(x))
            .join(' | ')}){${component.validation.children.min},${
            component.validation.children.max === Infinity ? '' : component.validation.children.max
          }}`,
          defining: true,
          attrs: {
            props: {
              default: toSerialized(getInitialPropsValue(schema), schema.fields),
            },
          },
          reactNodeView: {
            component: function Block(props) {
              const runCommand = useEditorDispatchCommand()
              const value = useDeserializedValue(props.node.attrs.props, component.schema)
              return 'NodeView' in component && component.NodeView ? (
                <component.NodeView
                  isSelected={props.hasNodeSelection || props.isNodeCompletelyWithinSelection}
                  onRemove={() => {
                    runCommand((state, dispatch) => {
                      if (dispatch) {
                        const pos = props.getPos()!
                        dispatch(state.tr.delete(pos, pos + props.node.nodeSize))
                      }
                      return true
                    })
                  }}
                  onChange={value => {
                    runCommand((state, dispatch) => {
                      if (dispatch) {
                        dispatch(
                          state.tr.setNodeAttribute(
                            props.getPos()!,
                            'props',
                            toSerialized(value, schema.fields)
                          )
                        )
                      }
                      return true
                    })
                  }}
                  value={value}
                >
                  {props.children}
                </component.NodeView>
              ) : (
                <BlockWrapper
                  node={props.node}
                  hasNodeSelection={props.hasNodeSelection || props.isNodeCompletelyWithinSelection}
                  component={component}
                  getPos={props.getPos}
                  toolbar={
                    props.node.contentMatchAt(props.node.childCount).defaultType &&
                    (component.children.length === 1 ? (
                      <Button
                        onPress={() => {
                          runCommand((state, dispatch) => {
                            if (dispatch) {
                              dispatch(
                                state.tr.insert(
                                  props.getPos()! + props.node.nodeSize - 1,
                                  state.schema.nodes[component.children[0]].createAndFill()!
                                )
                              )
                            }
                            return true
                          })
                        }}
                      >
                        Insert
                      </Button>
                    ) : (
                      <MenuTrigger>
                        <Button>Insert</Button>
                        <Menu
                          onAction={key => {
                            runCommand((state, dispatch) => {
                              if (dispatch) {
                                dispatch(
                                  state.tr.insert(
                                    props.getPos()! + props.node.nodeSize - 1,
                                    state.schema.nodes[key].createAndFill()!
                                  )
                                )
                              }
                              return true
                            })
                          }}
                          items={items}
                        >
                          {item => <Item key={item.key}>{item.label}</Item>}
                        </Menu>
                      </MenuTrigger>
                    ))
                  }
                >
                  {'ContentView' in component && component.ContentView ? (
                    <component.ContentView value={value}>{props.children}</component.ContentView>
                  ) : (
                    props.children
                  )}
                </BlockWrapper>
              )
            },
            rendersOwnContent: false,
          },
          toDOM(node) {
            return [
              'div',
              {
                'data-component': name,
                'data-props': serializeProps(node.attrs.props),
              },
              0,
            ]
          },
          parseDOM: [
            {
              tag: `div[data-component="${name}"]`,
              getAttrs: deserializeProps,
            },
          ],
          insertMenu: component.forSpecificLocations
            ? undefined
            : {
                label: component.label,
                command: insertNode,
                forToolbar: true,
                description: component.description,
                icon: component.icon,
              },
        }
      }
      if (spec) {
        return [[name, spec]]
      }
      return []
    })
  )
}

export function getCustomMarkSpecs(components: Record<string, ContentComponent>) {
  return Object.fromEntries(
    Object.entries(components).flatMap(([name, component]) => {
      if (component.kind !== 'mark') return []
      const schema = {
        kind: 'object' as const,
        fields: component.schema,
      }
      const tag = component.tag ?? 'span'

      const spec: MarkSpec = {
        attrs: {
          props: {
            default: toSerialized(getInitialPropsValue(schema), schema.fields),
          },
        },
        toDOM(mark) {
          const element = document.createElement(tag)
          element.setAttribute('data-component', name)
          element.setAttribute('data-props', serializeProps(mark.attrs.props))
          let deserialized: any
          let getDeserialized = () => {
            if (!deserialized) {
              deserialized = deserializeValue(mark.attrs.props, component.schema)
            }
            return deserialized
          }
          if (typeof component.className === 'function') {
            element.className = component.className({
              value: getDeserialized(),
            })
          } else if (typeof component.className === 'string') {
            element.className = component.className
          }
          if (typeof component.style === 'function') {
            Object.assign(element.style, component.style({ value: getDeserialized() }))
          } else if (component.style) {
            Object.assign(element.style, component.style)
          }
          return element
        },
        parseDOM: [
          {
            tag: `${tag}[data-component="${name}"]`,
            getAttrs: deserializeProps,
          },
        ],
      }

      return [[name, spec]]
    })
  )
}

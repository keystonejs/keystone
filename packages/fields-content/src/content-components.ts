import type { ReactElement, ReactNode } from 'react'
import type { ComponentSchema, ObjectField, ParsedValueForComponentSchema } from './form/api'

type WrapperComponentConfig<Schema extends Record<string, ComponentSchema>> = {
  label: string
  description?: string
  icon?: ReactElement
  schema: Schema
  forSpecificLocations?: boolean
} & (
  | {
      ContentView?: (props: {
        value: ParsedValueForComponentSchema<ObjectField<Schema>>
        children: ReactNode
      }) => ReactNode
    }
  | {
      NodeView?: (props: {
        value: ParsedValueForComponentSchema<ObjectField<Schema>>
        onChange(value: ParsedValueForComponentSchema<ObjectField<Schema>>): void
        onRemove(): void
        isSelected: boolean
        children: ReactNode
      }) => ReactNode
    }
)

type WrapperComponent<Schema extends Record<string, ComponentSchema>> =
  WrapperComponentConfig<Schema> & { kind: 'wrapper' }

export function wrapper<Schema extends Record<string, ComponentSchema>>(
  config: WrapperComponentConfig<Schema>
): WrapperComponent<Schema> {
  return { kind: 'wrapper', ...config }
}

type BlockComponentConfig<Schema extends Record<string, ComponentSchema>> = {
  label: string
  description?: string
  icon?: ReactElement
  schema: Schema
  forSpecificLocations?: boolean
} & (
  | {
      ContentView?: (props: {
        value: ParsedValueForComponentSchema<ObjectField<Schema>>
      }) => ReactNode
    }
  | {
      NodeView?: (props: {
        value: ParsedValueForComponentSchema<ObjectField<Schema>>
        onChange(value: ParsedValueForComponentSchema<ObjectField<Schema>>): void
        onRemove(): void
        isSelected: boolean
      }) => ReactNode
    }
)

type BlockComponent<Schema extends Record<string, ComponentSchema>> =
  BlockComponentConfig<Schema> & {
    kind: 'block'
    // this is here instead of BlockComponentConfig so it's a little hidden
    // since it shouldn't be used often
    handleFile?: (file: File) => false | Promise<ParsedValueForComponentSchema<ObjectField<Schema>>>
  }

export function block<Schema extends Record<string, ComponentSchema>>(
  config: BlockComponentConfig<Schema>
): BlockComponent<Schema> {
  return { kind: 'block', ...config }
}

type InlineComponentConfig<Schema extends Record<string, ComponentSchema>> = {
  label: string
  description?: string
  icon?: ReactElement
  schema: Schema
  ToolbarView?(props: {
    value: ParsedValueForComponentSchema<ObjectField<Schema>>
    onChange(value: ParsedValueForComponentSchema<ObjectField<Schema>>): void
    onRemove(): void
  }): ReactNode
} & (
  | {
      ContentView?: (props: {
        value: ParsedValueForComponentSchema<ObjectField<Schema>>
      }) => ReactNode
    }
  | {
      NodeView?: (props: {
        value: ParsedValueForComponentSchema<ObjectField<Schema>>
        onChange(value: ParsedValueForComponentSchema<ObjectField<Schema>>): void
        onRemove(): void
        isSelected: boolean
      }) => ReactNode
    }
)

type InlineComponent<Schema extends Record<string, ComponentSchema>> =
  InlineComponentConfig<Schema> & {
    kind: 'inline'
    // this is here instead of InlineComponentConfig so it's a little hidden
    // since it shouldn't be used often
    handleFile?: (file: File) => false | Promise<ParsedValueForComponentSchema<ObjectField<Schema>>>
  }

export function inline<Schema extends Record<string, ComponentSchema>>(
  config: InlineComponentConfig<Schema>
): InlineComponent<Schema> {
  return { kind: 'inline', ...config }
}

type Thing<T, Schema extends Record<string, ComponentSchema>> =
  | T
  // this is so that it's bivariant
  | {
      method(props: { value: ParsedValueForComponentSchema<ObjectField<Schema>> }): T
    }['method']

type MarkComponentConfig<Schema extends Record<string, ComponentSchema>> = {
  label: string
  icon: ReactElement
  schema: Schema
  tag?:
    | 'span'
    | 'strong'
    | 'em'
    | 'u'
    | 'del'
    | 'code'
    | 'a'
    | 'sub'
    | 'sup'
    | 'kbd'
    | 'abbr'
    | 'mark'
    | 's'
    | 'small'
    | 'big'
  style?: Thing<{ [key: string]: string }, Schema>
  className?: Thing<string, Schema>
}

type MarkComponent<Schema extends Record<string, ComponentSchema>> = MarkComponentConfig<Schema> & {
  kind: 'mark'
}

export function mark<Schema extends Record<string, ComponentSchema>>(
  config: MarkComponentConfig<Schema>
): MarkComponent<Schema> {
  return { kind: 'mark', ...config }
}

type RepeatingComponentConfig<Schema extends Record<string, ComponentSchema>> =
  WrapperComponentConfig<Schema> & {
    children: string | string[]
    validation?: { children?: { min?: number; max?: number } }
  }

type RepeatingComponent<Schema extends Record<string, ComponentSchema>> =
  WrapperComponentConfig<Schema> & {
    kind: 'repeating'
    children: string[]
    validation: { children: { min: number; max: number } }
  }

export function repeating<Schema extends Record<string, ComponentSchema>>(
  config: RepeatingComponentConfig<Schema>
): RepeatingComponent<Schema> {
  return {
    kind: 'repeating',
    ...config,
    children: Array.isArray(config.children) ? config.children : [config.children],
    validation: {
      children: {
        min: config.validation?.children?.min ?? 0,
        max: config.validation?.children?.max ?? Infinity,
      },
    },
  }
}

export type ContentComponent =
  | WrapperComponent<Record<string, ComponentSchema>>
  | BlockComponent<Record<string, ComponentSchema>>
  | RepeatingComponent<Record<string, ComponentSchema>>
  | InlineComponent<Record<string, ComponentSchema>>
  | MarkComponent<Record<string, ComponentSchema>>

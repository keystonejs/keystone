import { Picker, Item } from '@keystar/ui/picker'
import { useFieldSpan } from '../context'

export function SelectFieldInput<Value extends string>(props: {
  value: Value
  onChange: (value: Value) => void
  autoFocus?: boolean
  label: string
  description?: string
  options: readonly { label: string; value: Value }[]
}) {
  let fieldSpan = useFieldSpan()

  return (
    <Picker
      label={props.label}
      description={props.description}
      items={props.options}
      selectedKey={props.value}
      onSelectionChange={key => {
        props.onChange(key as Value)
      }}
      autoFocus={props.autoFocus}
      width={{
        mobile: 'auto',
        tablet: fieldSpan === 12 ? 'alias.singleLineWidth' : 'auto',
      }}
    >
      {item => <Item key={item.value}>{item.label}</Item>}
    </Picker>
  )
}

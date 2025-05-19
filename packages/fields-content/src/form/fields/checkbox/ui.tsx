import type { FormFieldInputProps } from '../../api'
import { Checkbox } from '@keystar/ui/checkbox'
import { Text } from '@keystar/ui/typography'

export function CheckboxFieldInput(
  props: FormFieldInputProps<boolean> & {
    label: string
    description?: string
  }
) {
  return (
    <Checkbox isSelected={props.value} onChange={props.onChange} autoFocus={props.autoFocus}>
      <Text>{props.label}</Text>
      {props.description && <Text slot="description">{props.description}</Text>}
    </Checkbox>
  )
}

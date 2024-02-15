/** @jsxRuntime classic */
/** @jsx jsx */

import { Button } from '@keystone-ui/button'
import { jsx, Stack } from '@keystone-ui/core'
import { useToasts } from '@keystone-ui/toast'

import { Page } from '../../components/Page'
import { capitalise } from '../../utils'

export default function OptionsPage () {
  const { addToast } = useToasts()
  return (
    <Page>
      <Stack marginTop="large" gap="small">
        {(['positive', 'negative', 'warning', 'help'] as const).map(tone => {
          return (
            <Button
              onClick={() => {
                addToast({ title: `${capitalise(tone)} toast`, tone })
              }}
            >
              Add {tone} toast
            </Button>
          )
        })}
        <Button
          onClick={() => {
            addToast({
              title: `Title`,
              message:
                'Optional long-form message content, to give the user additional information or context',
              tone: 'help',
            })
          }}
        >
          Add toast with message
        </Button>
      </Stack>
    </Page>
  )
}

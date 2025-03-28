import { useId } from '@react-aria/utils'
import { useState } from 'react'

import { Button, ButtonGroup } from '@keystar/ui/button'
import { Checkbox, CheckboxGroup } from '@keystar/ui/checkbox'
import { Dialog, useDialogContainer } from '@keystar/ui/dialog'
import { VStack } from '@keystar/ui/layout'
import { TextLink } from '@keystar/ui/link'
import { Content } from '@keystar/ui/slots'
import { TextField } from '@keystar/ui/text-field'
import { Emoji, Heading, Text } from '@keystar/ui/typography'

const newsletterUrl = 'https://endpoints.thinkmill.com.au/newsletter'
const emailValidationMessage = 'Please enter a valid email address.'

function validateEmail(value: string) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    value
  )
}

export function WelcomeDialog() {
  const [subscribe, setSubscribe] = useState(['keystone'])
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const formId = useId()
  const dialog = useDialogContainer()

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    // Check if user wants to subscribe and a valid email address
    if (subscribe.length) {
      setLoading(true)

      if (!validateEmail(email)) {
        setError(emailValidationMessage)
        return
      }

      const tags = ['source:@keystone-6/auth']
      subscribe.forEach(list => tags.push(`list:${list}`))

      const res = await fetch(newsletterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, tags }),
      })

      try {
        if (res.status !== 200) {
          const { error } = await res.json()
          setError(error)
          return
        }
      } catch (e: any) {
        // network errors or failed parse
        setError(e.message.toString())
        return
      }

      setLoading(false)
    }

    dialog.dismiss()
  }

  return (
    <Dialog size="small">
      <Heading>
        Welcome <Emoji symbol="👋" />
      </Heading>

      <Content>
        <VStack gap="xlarge">
          <Text elementType="p">
            Thanks for installing Keystone, checkout the{' '}
            <TextLink href="https://keystonejs.com">documentation</TextLink> for help getting
            started. To stay connected{' '}
            <TextLink href="https://twitter.com/keystonejs" target="_blank">
              follow us on twitter
            </TextLink>
            , and to hear about the latest news sign up to our newsletters:
          </Text>

          <form id={formId} onSubmit={onSubmit}>
            <VStack gap="medium">
              <TextField
                label="Email"
                name="email"
                isRequired
                value={email}
                onChange={setEmail}
                onBlur={() => setError(validateEmail(email) ? null : emailValidationMessage)}
                placeholder="example@gmail.com"
                errorMessage={error}
              />
              <CheckboxGroup onChange={setSubscribe} value={subscribe}>
                <Checkbox value="keystone">Keystone news</Checkbox>
                <Checkbox value="thinkmill">Thinkmill news</Checkbox>
              </CheckboxGroup>
            </VStack>
          </form>
        </VStack>
      </Content>

      <ButtonGroup>
        <Button onPress={dialog.dismiss}>Cancel</Button>
        <Button form={formId} prominence="high" type="submit" isPending={loading}>
          Subscribe
        </Button>
      </ButtonGroup>
    </Dialog>
  )
}

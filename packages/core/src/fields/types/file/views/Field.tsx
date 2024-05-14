/** @jsxRuntime classic */
/** @jsx jsx */
import { useMemo, useRef, type RefObject } from 'react'
import bytes from 'bytes'

import { jsx, Stack, Text } from '@keystone-ui/core'
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields'

import { Button } from '@keystone-ui/button'
import { type FieldProps } from '../../../../types'
import { type FileValue } from './index'
import { type controller } from '.'

export function Field ({
  autoFocus,
  field,
  value,
  onChange,
}: FieldProps<typeof controller>) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const errorMessage = createErrorMessage(value)

  const onUploadChange = ({
    currentTarget: { validity, files },
  }: React.SyntheticEvent<HTMLInputElement>) => {
    const file = files?.[0]
    if (!file) return // bail if the user cancels from the file browser
    onChange?.({
      kind: 'upload',
      data: { file, validity },
      previous: value,
    })
  }

  // Generate a random input key when the value changes, to ensure the file input is unmounted and
  // remounted (this is the only way to reset its value and ensure onChange will fire again if
  // the user selects the same file again)
  const inputKey = useMemo(() => Math.random(), [value])

  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
      <FileView errorMessage={errorMessage} value={value} onChange={onChange} inputRef={inputRef} />
      <input
        css={{ display: 'none' }}
        autoComplete="off"
        autoFocus={autoFocus}
        ref={inputRef}
        key={inputKey}
        name={field.path}
        onChange={onUploadChange}
        type="file"
        disabled={onChange === undefined}
        aria-describedby={field.description === null ? undefined : `${field.path}-description`}
      />
    </FieldContainer>
  )
}

function FileView ({
  errorMessage,
  value,
  onChange,
  inputRef,
}: {
  errorMessage?: string
  value: FileValue
  onChange?: (value: FileValue) => void
  inputRef: RefObject<HTMLInputElement>
}) {
  return value.kind === 'from-server' || value.kind === 'upload' ? (
    <Stack gap="small" across align="center">
      {onChange && (
        <Stack gap="small">
          {value.kind === 'from-server' && (
            <Stack padding="xxsmall" gap="xxsmall">
              <Text size="small">
                <a href={value.data.src} target="_blank">
                  {`${value.data.filename}`}
                </a>
              </Text>
              <Text size="small">Size: {bytes(value.data.filesize)}</Text>
            </Stack>
          )}
          {value.kind === 'upload' && (
            <Stack padding="xxsmall" gap="xxsmall">
              <Text size="small" paddingBottom="xsmall">
                File linked, save to complete upload
              </Text>
              <Text size="small">Size: {bytes(value.data.file.size)}</Text>
            </Stack>
          )}
          <Stack across gap="small" align="center">
            <Button
              size="small"
              onClick={() => {
                inputRef.current?.click()
              }}
            >
              Change
            </Button>
            {value.kind === 'from-server' && (
              <Button
                size="small"
                tone="negative"
                onClick={() => {
                  onChange({ kind: 'remove', previous: value })
                }}
              >
                Remove
              </Button>
            )}
            {value.kind === 'upload' && (
              <Button
                size="small"
                tone="negative"
                onClick={() => {
                  onChange(value.previous)
                }}
              >
                Cancel
              </Button>
            )}
            {errorMessage && (
              <span
                css={{
                  display: 'block',
                  marginTop: '8px',
                  color: 'red',
                }}
              >
                {errorMessage}
              </span>
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  ) : (
    <Stack gap="small">
      <Stack css={{ alignItems: 'center' }} gap="small" across>
        <Button
          size="small"
          disabled={onChange === undefined}
          onClick={() => {
            inputRef.current?.click()
          }}
        >
          Upload File
        </Button>
        {value.kind === 'remove' && value.previous && (
          <Button
            size="small"
            tone="negative"
            onClick={() => {
              if (value.previous !== undefined) {
                onChange?.(value?.previous)
              }
            }}
          >
            Undo removal
          </Button>
        )}
      </Stack>
    </Stack>
  )
}

function createErrorMessage (value: FileValue) {
  if (value.kind === 'upload') {
    return validateFile(value.data)
  }
}

export function validateFile ({ validity }: { validity: ValidityState }): string | undefined {
  if (!validity.valid) {
    return 'Something went wrong, please reload and try again.'
  }
}

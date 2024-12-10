import { useLocale } from '@react-aria/i18n'
import bytes, { type BytesOptions } from 'bytes'
import { extname } from 'path'
import React, {
  type PropsWithChildren,
  type ReactElement,
  type SyntheticEvent,
  Fragment,
  useMemo,
  useRef,
} from 'react'

import { ActionButton } from '@keystar/ui/button'
import { Icon } from '@keystar/ui/icon'
import { fileIcon } from '@keystar/ui/icon/icons/fileIcon'
import { fileAudioIcon } from '@keystar/ui/icon/icons/fileAudioIcon'
import { fileCodeIcon } from '@keystar/ui/icon/icons/fileCodeIcon'
import { fileDigitIcon } from '@keystar/ui/icon/icons/fileDigitIcon'
import { fileImageIcon } from '@keystar/ui/icon/icons/fileImageIcon'
import { fileJsonIcon } from '@keystar/ui/icon/icons/fileJsonIcon'
import { fileSpreadsheetIcon } from '@keystar/ui/icon/icons/fileSpreadsheetIcon'
import { fileTextIcon } from '@keystar/ui/icon/icons/fileTextIcon'
import { fileVideoIcon } from '@keystar/ui/icon/icons/fileVideoIcon'
import { fileUpIcon } from '@keystar/ui/icon/icons/fileUpIcon'
import { Field as KeystarField } from '@keystar/ui/field'
import { HStack, VStack } from '@keystar/ui/layout'
import { css } from '@keystar/ui/style'
import { Text } from '@keystar/ui/typography'

import { type FieldProps } from '../../../../types'
import { type FileValue } from './index'
import { type controller } from '.'

export function Field (props: FieldProps<typeof controller>) {
  const { autoFocus, field, onChange, value } = props

  const inputRef = useRef<HTMLInputElement | null>(null)
  const errorMessage = createErrorMessage(value)

  const onUploadChange = ({
    currentTarget: { validity, files },
  }: SyntheticEvent<HTMLInputElement>) => {
    const file = files?.[0]
    if (!file) return // bail if the user cancels from the file browser
    onChange?.({
      kind: 'upload',
      data: { file, validity },
      previous: value,
    })
  }
  const onFileTrigger = () => {
    inputRef.current?.click()
  }

  // Generate a random input key when the value changes, to ensure the file input is unmounted and
  // remounted (this is the only way to reset its value and ensure onChange will fire again if
  // the user selects the same file again)
  const inputKey = useMemo(() => Math.random(), [value])

  return (
    <KeystarField
      label={field.label}
      description={field.description}
      errorMessage={errorMessage}
    >
      {inputProps => (
        <Fragment>
          <FileView
            isInvalid={Boolean(errorMessage)}
            onFileTrigger={onFileTrigger}
            onChange={onChange}
            value={value}
          />
          <input
            {...inputProps}
            // TODO: add support for configurable file types
            // @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
            autoComplete="off"
            autoFocus={autoFocus}
            disabled={onChange === undefined}
            hidden
            key={inputKey}
            name={field.path}
            onChange={onUploadChange}
            ref={inputRef}
            type="file"
          />
        </Fragment>
      )}
    </KeystarField>
  )
}

function FileView(props: {
  onFileTrigger: () => void
  isInvalid?: boolean
  onChange?: (value: FileValue) => void
  value: FileValue
}) {
  const { isInvalid, onFileTrigger, onChange, value } = props
  const fileData = useFileData(value)

  return (
    <VStack gap="medium">
      {isInvalid || !fileData ? null : (
        <FileDetails {...fileData}>
          {onChange && (
            <HStack gap="regular" marginTop="auto">
              <ActionButton onPress={onFileTrigger}>Change</ActionButton>
              {value.kind === 'from-server' && (
                <ActionButton
                  prominence="low"
                  onPress={() => {
                    onChange({ kind: 'remove', previous: value })
                  }}
                >
                  Remove
                </ActionButton>
              )}
              {value.kind === 'upload' && (
                <ActionButton
                  prominence="low"
                  onPress={() => {
                    onChange(value.previous)
                  }}
                >
                  Cancel
                </ActionButton>
              )}
            </HStack>
          )}
        </FileDetails>
      )}

      {!fileData && (
        <HStack gap="regular">
          <ActionButton
            isDisabled={onChange === undefined}
            onPress={onFileTrigger}
          >
            Upload
          </ActionButton>
          {value.kind === 'remove' && value.previous && (
            <ActionButton
              prominence="low"
              onPress={() => {
                if (value.previous !== undefined) {
                  onChange?.(value?.previous)
                }
              }}
            >
              Undo removal
            </ActionButton>
          )}
        </HStack>
      )}
    </VStack>
  )
}

function FileDetails(props: PropsWithChildren<FileData>) {
  const trimStartStyles = useTrimStartStyles()

  return (
    <HStack
      backgroundColor="canvas"
      border="neutral"
      borderRadius="regular"
      gap="medium"
      padding="medium"
    >
      <HStack
        alignItems="center"
        backgroundColor="surfaceTertiary"
        borderRadius="small"
        justifyContent="center"
        height="100%"
        UNSAFE_className={css({ aspectRatio: '1 / 1' })}
      >
        <Icon src={props.icon} size="medium" color="neutral" />
      </HStack>
      <VStack gap="medium" minWidth="alias.singleLineWidth" flex>
        <Text>
          <span className={css(trimStartStyles)} title={props.name}>
            {props.name}
          </span>
        </Text>
        <Text size="small" color="neutralSecondary">
          {formatBytes(props.size)}
        </Text>

        {/* field controls dependant on value type */}
        {props.children}
      </VStack>
    </HStack>
  )
}

export function formatBytes(size: number, options = defaultBytesOptions(size)) {
  return bytes(size, options)
}

function defaultBytesOptions(size: number): BytesOptions {
  // increase precision for larger files
  const GB = 1_000_000_000
  const MB = 1_000_000
  const decimalPlaces = size >= GB ? 2 : size >= MB ? 1 : 0

  return { decimalPlaces }
}

type FileData = {
  icon: ReactElement
  name: string
  size: number
}

function useFileData(value: FileValue): FileData | null {
  switch (value.kind) {
    case 'from-server':
      return {
        icon: getFileIcon(value.data.filename),
        name: value.data.filename,
        size: value.data.filesize,
      }
    case 'upload':
      return {
        icon: fileUpIcon,
        name: value.data.file.name,
        size: value.data.file.size,
      }
    default:
      return null
  }
}

// prettier-ignore
const FILE_TYPES = {
  audio: new Set(['aac', 'aiff', 'alac', 'flac', 'm4a', 'mp3', 'ogg', 'wav', 'wma']),
  binary: new Set(['bin', 'dat', 'exe', 'iso', 'pkg', 'rar', 'tar', 'zip']),
  code: new Set(['c', 'cpp', 'cs', 'css', 'go', 'html', 'java', 'js', 'jsx', 'less', 'php', 'py', 'rb', 'rs', 'scss', 'ts', 'tsx', 'xml']),
  image: new Set(['avif', 'bmp', 'gif', 'heic', 'ico', 'jpeg', 'jpg', 'png', 'svg', 'tiff', 'webp']),
  json: new Set(['geojson', 'json', 'json5', 'jsonld']),
  spreadsheet: new Set(['csv', 'ods', 'tsv', 'xls', 'xlsx']),
  text: new Set(['doc', 'docx', 'eml', 'log', 'md', 'msg', 'odt', 'pdf', 'rtf', 'tex', 'txt']),
  video: new Set(['avi', 'flv', 'm4v', 'mkv', 'mov', 'mp4', 'ogg', 'webm', 'wmv']),
}

function getFileIcon(filename: string) {
  const extension = getExtension(filename)

  if (FILE_TYPES.audio.has(extension)) return fileAudioIcon
  if (FILE_TYPES.binary.has(extension)) return fileDigitIcon
  if (FILE_TYPES.code.has(extension)) return fileCodeIcon
  if (FILE_TYPES.image.has(extension)) return fileImageIcon
  if (FILE_TYPES.json.has(extension)) return fileJsonIcon
  if (FILE_TYPES.spreadsheet.has(extension)) return fileSpreadsheetIcon
  if (FILE_TYPES.text.has(extension)) return fileTextIcon
  if (FILE_TYPES.video.has(extension)) return fileVideoIcon

  return fileIcon
}
function getExtension(filename: string) {
  // `extname` returns e.g. ".mov", remove leading dot to match "mov"
  return extname(filename).slice(1).toLowerCase()
}

export function useTrimStartStyles() {
  const { direction } = useLocale()
  return {
    direction: direction === 'rtl' ? 'ltr' : 'rtl',
    display: 'block',
    overflow: 'hidden',
    textAlign: direction === 'rtl' ? 'right' : 'left',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const
}

function createErrorMessage(value: FileValue) {
  if (value.kind === 'upload') {
    return validateFile(value.data)
  }
}

export function validateFile({ validity }: { validity: ValidityState }) {
  if (!validity.valid) {
    return 'Something went wrong, please reload and try again.'
  }
}

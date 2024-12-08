/** @jsxRuntime classic */
/** @jsx jsx */

import bytes from 'bytes'
import { Fragment, type ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { jsx, Stack, Text } from '@keystone-ui/core'
import { FieldContainer, FieldDescription, FieldLabel } from '@keystone-ui/fields'
import { Button } from '@keystone-ui/button'
import { type FieldProps } from '../../../../types'
import { SUPPORTED_IMAGE_EXTENSIONS } from '../utils'
import { type ImageValue } from './index'
import { type controller } from '.'

function useObjectURL (fileData: File | undefined) {
  const [objectURL, setObjectURL] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (fileData) {
      const url = URL.createObjectURL(fileData)
      setObjectURL(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [fileData])
  return objectURL
}

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
  const accept = useMemo(
    () => SUPPORTED_IMAGE_EXTENSIONS.map(ext => [`.${ext}`, `image/${ext}`].join(', ')).join(', '),
    []
  )
  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>{field.description}</FieldDescription>
      <ImgView
        errorMessage={errorMessage}
        value={value}
        onChange={onChange}
        field={field}
        inputRef={inputRef}
      />
      <input
        css={{ display: 'none' }}
        autoComplete="off"
        autoFocus={autoFocus}
        ref={inputRef}
        key={inputKey}
        name={field.path}
        onChange={onUploadChange}
        type="file"
        accept={accept}
        aria-describedby={field.description === null ? undefined : `${field.path}-description`}
        disabled={onChange === undefined}
      />
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
    </FieldContainer>
  )
}

function ImgView ({
  errorMessage,
  value,
  onChange,
  field,
  inputRef,
}: {
  errorMessage?: string
  value: ImageValue
  onChange?: (value: ImageValue) => void
  field: ReturnType<typeof controller>
  inputRef: RefObject<HTMLInputElement>
}) {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const imagePathFromUpload = useObjectURL(
    errorMessage === undefined && value.kind === 'upload' ? value.data.file : undefined
  )
  const imageSrc = value.kind === 'from-server' ? value.data.src : imagePathFromUpload

  return (
    <Stack gap="small" across align="end">
      <ImageWrapper url={value.kind === 'from-server' ? imageSrc : undefined}>
        {errorMessage || (value.kind !== 'from-server' && value.kind !== 'upload') ? (
          <Placeholder />
        ) : (
          <Fragment>
            {value.kind === 'upload' && (
              <div
                css={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  color: 'white',
                  textAlign: 'center',
                  wordWrap: 'break-word',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '25px',
                  backgroundColor: 'rgba(17, 24, 39, 0.65)',
                  lineHeight: '1.15',
                  fontWeight: 500,
                }}
              >
                Save to complete upload
              </div>
            )}
            <img
              onLoad={event => {
                if (value.kind === 'upload') {
                  setImageDimensions({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  })
                }
              }}
              css={{
                objectFit: 'contain',
                width: '100%',
                height: '100%',
              }}
              alt={`Image uploaded to ${field.path} field`}
              src={imageSrc}
            />
          </Fragment>
        )}
      </ImageWrapper>
      {value.kind === 'from-server' || value.kind === 'upload' ? (
        onChange && (
          <Stack
            gap="small"
            css={{
              height: '120px',
              justifyContent: 'flex-end',
            }}
          >
            {errorMessage === undefined ? (
              <ImageMeta
                {...(value.kind === 'from-server'
                  ? {
                      width: value.data.width,
                      height: value.data.height,
                      url: value.data.src,
                      name: `${value.data.id}.${value.data.extension}`,
                      size: value.data.filesize,
                    }
                  : {
                      width: imageDimensions.width,
                      height: imageDimensions.height,
                      size: value.data.file.size,
                    })}
              />
            ) : null}
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
            </Stack>
          </Stack>
        )
      ) : (
        <Stack across gap="small" align="center">
          <Button
            size="small"
            disabled={onChange === undefined}
            onClick={() => {
              inputRef.current?.click()
            }}
          >
            Upload Image
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
      )}
    </Stack>
  )
}

function createErrorMessage (value: ImageValue) {
  if (value.kind === 'upload') {
    return validateImage(value.data)
  }
}

export function validateImage ({
  file,
  validity,
}: {
  file: File
  validity: ValidityState
}): string | undefined {
  if (!validity.valid) {
    return 'Something went wrong, please reload and try again.'
  }
  // check if the file is actually an image
  if (!file.type.includes('image')) {
    return `Sorry, that file type isn't accepted. Please try ${SUPPORTED_IMAGE_EXTENSIONS.reduce(
      (acc, curr, currentIndex) => {
        if (currentIndex === SUPPORTED_IMAGE_EXTENSIONS.length - 1) {
          acc += ` or .${curr}`
        } else if (currentIndex > 0) {
          acc += `, .${curr}`
        } else {
          acc += `.${curr}`
        }
        return acc
      },
      ''
    )}.`
  }
}

// ==============================
// Styled Components
// ==============================

export const ImageMeta = ({
  width = 0,
  height = 0,
  size,
}: {
  width?: number
  height?: number
  size: number
}) => {
  return (
    <Stack padding="xxsmall" gap="xxsmall">
      <Text size="small">Size: {`${bytes(size)}`}</Text>
      <Text size="small">Dimensions: {`${width} x ${height}`}</Text>
    </Stack>
  )
}

export const ImageWrapper = ({ children, url }: { children: ReactNode, url?: string }) => {
  if (url) {
    return (
      <a
        css={{
          position: 'relative',
          display: 'block',
          overflow: 'hidden',
          flexShrink: 0,
          lineHeight: 0,
          backgroundColor: '#fafbfc',
          borderRadius: '6px',
          textAlign: 'center',
          width: '120px', // 120px image + chrome
          height: '120px',
          border: '1px solid #e1e5e9',
        }}
        target="_blank"
        href={url}
      >
        {children}
      </a>
    )
  }
  return (
    <div
      css={{
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        lineHeight: 0,
        backgroundColor: '#fafbfc',
        borderRadius: '6px',
        textAlign: 'center',
        width: '120px', // 120px image + chrome
        height: '120px',
        border: '1px solid #e1e5e9',
      }}
    >
      {children}
    </div>
  )
}

export const Placeholder = () => {
  return (
    <svg
      css={{
        width: '100%',
        height: '100%',
      }}
      width="120"
      height="120"
      viewBox="0 0 121 121"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M47.8604 45.6729H72.8604C73.5234 45.6729 74.1593 45.9362 74.6281 46.4051C75.097 46.8739 75.3604 47.5098 75.3604 48.1729V73.1729C75.3604 73.8359 75.097 74.4718 74.6281 74.9406C74.1593 75.4095 73.5234 75.6729 72.8604 75.6729H47.8604C47.1973 75.6729 46.5614 75.4095 46.0926 74.9406C45.6237 74.4718 45.3604 73.8359 45.3604 73.1729V48.1729C45.3604 47.5098 45.6237 46.8739 46.0926 46.4051C46.5614 45.9362 47.1973 45.6729 47.8604 45.6729ZM47.8604 65.6729V73.1729H72.8604V70.6729L66.6104 64.4229L64.6229 66.4104C64.1544 66.876 63.5208 67.1373 62.8604 67.1373C62.1999 67.1373 61.5663 66.876 61.0979 66.4104L54.1104 59.4229L47.8604 65.6729ZM68.3729 62.6479L72.8604 67.1354V48.1729H47.8604V62.1354L52.3479 57.6479C52.8163 57.1822 53.4499 56.9209 54.1104 56.9209C54.7708 56.9209 55.4044 57.1822 55.8729 57.6479L62.8604 64.6354L64.8479 62.6479C65.3163 62.1822 65.9499 61.9209 66.6104 61.9209C67.2708 61.9209 67.9044 62.1822 68.3729 62.6479ZM66.1937 57.5409C65.5771 57.9529 64.852 58.1729 64.1104 58.1729C63.1158 58.1729 62.162 57.7778 61.4587 57.0745C60.7554 56.3712 60.3604 55.4174 60.3604 54.4229C60.3604 53.6812 60.5803 52.9561 60.9923 52.3395C61.4044 51.7228 61.9901 51.2421 62.6753 50.9583C63.3605 50.6745 64.1145 50.6002 64.8419 50.7449C65.5694 50.8896 66.2376 51.2468 66.762 51.7712C67.2864 52.2956 67.6436 52.9638 67.7883 53.6913C67.933 54.4187 67.8587 55.1727 67.5749 55.8579C67.2911 56.5431 66.8104 57.1288 66.1937 57.5409ZM64.8048 53.3835C64.5993 53.2462 64.3576 53.1729 64.1104 53.1729C63.7788 53.1729 63.4609 53.3046 63.2265 53.539C62.992 53.7734 62.8604 54.0913 62.8604 54.4229C62.8604 54.6701 62.9337 54.9118 63.071 55.1173C63.2084 55.3229 63.4036 55.4831 63.632 55.5777C63.8604 55.6723 64.1117 55.6971 64.3542 55.6488C64.5967 55.6006 64.8194 55.4816 64.9942 55.3067C65.1691 55.1319 65.2881 54.9092 65.3363 54.6667C65.3846 54.4242 65.3598 54.1729 65.2652 53.9445C65.1706 53.7161 65.0104 53.5209 64.8048 53.3835Z"
        fill="#b1b5b9"
      />
    </svg>
  )
}

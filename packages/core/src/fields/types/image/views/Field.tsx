import React, {
  type PropsWithChildren,
  type SyntheticEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { ActionButton } from '@keystar/ui/button'
import { Field as KeystarField } from '@keystar/ui/field'
import { HStack, VStack } from '@keystar/ui/layout'
import { css, tokenSchema, transition } from '@keystar/ui/style'
import { Text } from '@keystar/ui/typography'

import type { FieldProps } from '../../../../types'
import { formatBytes, useTrimStartStyles } from '../../file/views/Field'
import type { ImageValue } from './index'
import {
  type controller,
  validateImage
} from '.'

export function Field (props: FieldProps<typeof controller>) {
  const { autoFocus, field, onChange, value } = props
  const inputRef = useRef<HTMLInputElement | null>(null)
  const errorMessage = validateImage(field.extensions, value)

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
  const accept = useMemo(
    () =>
      field.extensions.map(ext =>
        [`.${ext}`, `image/${ext}`].join(', ')
      ).join(', '),
    []
  )

  return (
    <KeystarField
      label={field.label}
      description={field.description}
      errorMessage={errorMessage}
    >
      {inputProps => (
        <Fragment>
          <ImageView
            isInvalid={Boolean(errorMessage)}
            onFileTrigger={onFileTrigger}
            onChange={onChange}
            value={value}
          />
          <input
            {...inputProps}
            accept={accept}
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

function ImageView (props: {
  onFileTrigger: () => void
  isInvalid?: boolean
  onChange?: (value: ImageValue) => void
  value: ImageValue
}) {
  const { isInvalid, onFileTrigger, onChange, value } = props
  const imageData = useImageData(value)

  return (
    <VStack gap="regular">
      {isInvalid || !imageData ? null : (
        <ImageDetails {...imageData}>
          {onChange && (
            <HStack gap="regular" alignItems="center" marginTop="auto">
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
        </ImageDetails>
      )}

      {!imageData && (
        <HStack gap="regular" alignItems="center">
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

function useObjectURL (fileData: File | undefined) {
  const [objectURL, setObjectURL] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (!fileData) return
    const url = URL.createObjectURL(fileData)
    setObjectURL(url)
    return () => URL.revokeObjectURL(url)
  }, [fileData])
  return objectURL
}

// ==============================
// Styled Components
// ==============================

const SMALL_CONTAINER_MAX = `@container (max-width: 419px)`
const SMALL_CONTAINER_MIN = `@container (min-width: 420px)`

function ImageDetails (props: PropsWithChildren<ImageData>) {
  const trimStartStyles = useTrimStartStyles()

  // hide content until the uploaded image until it's available; use dimensions
  // as an indicator since they're set on load.
  const loadedStyles = {
    opacity: props.height && props.width ? 1 : 0,
    transition: transition('opacity'),
  }

  return (
    <div
      className={css({
        backgroundColor: tokenSchema.color.background.canvas,
        border: `1px solid ${tokenSchema.color.border.neutral}`,
        borderRadius: tokenSchema.size.radius.regular,
        minHeight: tokenSchema.size.scale['1600'],
        contain: 'paint', // crop img to border radius
        display: 'flex',

        [SMALL_CONTAINER_MAX]: {
          flexDirection: 'column',
        },
      })}
    >
      <img
        onLoad={props.onLoad}
        className={css({
          maxHeight: tokenSchema.size.scale[6000], // constrain tall/narrow images
          maxWidth: '100%', // constrain to container width
          minWidth: 0, // allow the image to shrink properly
          objectFit: 'cover', // fill available space w/o distorting

          [SMALL_CONTAINER_MIN]: {
            height: tokenSchema.size.scale['1600'],
          },
        })}
        style={loadedStyles}
        alt="preview of the upload"
        src={props.url}
      />
      <VStack
        gap="medium"
        padding="large"
        flex
        UNSAFE_className={css({
          // ensure the metadata doesn't shrink too much, 40% allows more
          // breathing room where available with a hard limit pixel value
          minWidth: `max(${tokenSchema.size.alias.singleLineWidth}, 40%)`,
        })}
        UNSAFE_style={loadedStyles}
      >
        {props.name ? (
          <Text>
            <span className={css(trimStartStyles)} title={props.name}>
              {props.name}
            </span>
          </Text>
        ) : null}
        {props.filesize ? (
          <Text size="small" color="neutralSecondary" overflow="unset">
            {formatBytes(props.filesize)} &middot; {props.width}
            &#8239;&times;&#8239;
            {props.height}
          </Text>
        ) : null}

        {/* field controls dependant on value type */}
        {props.children}
      </VStack>
    </div>
  )
}

type ImageData = {
  name?: string
  url: string
  filesize?: number
  width?: number
  height?: number
  onLoad: (event: SyntheticEvent<HTMLImageElement>) => void
}

function useImageData (value: ImageValue): ImageData | null {
  // only relevant for uploaded images, but we must observe the rules of hooks
  // so these can't be called conditionally.
  const imagePathFromUpload = useObjectURL(value.kind === 'upload' ? value.data.file : undefined)
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 })
  const onLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      if (value.kind === 'upload') {
        setDimensions({
          height: event.currentTarget.naturalHeight,
          width: event.currentTarget.naturalWidth,
        })
      }
    },
    [value.kind]
  )

  // reset dimensions when the user cancels the upload. we use the dimensions as
  // a signal that the image has loaded.
  useEffect(() => {
    if (value.kind !== 'upload') {
      setDimensions({ height: 0, width: 0 })
    }
  }, [value.kind])

  switch (value.kind) {
    case 'from-server':
      return {
        url: value.data.url,
        name: `${value.data.id}.${value.data.extension}`,
        filesize: value.data.filesize,
        width: value.data.width,
        height: value.data.height,
        onLoad,
      } as const

    case 'upload':
      return {
        // always string for simpler types, should be unreachable if the file selection fails validation.
        url: imagePathFromUpload || '',
        name: value.data.file.name,
        filesize: value.data.file.size,
        width: dimensions.width,
        height: dimensions.height,
        onLoad,
      } as const
  }

  return null
}

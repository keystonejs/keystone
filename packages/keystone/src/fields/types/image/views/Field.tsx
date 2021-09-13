/** @jsxRuntime classic */
/** @jsx jsx */

import copy from 'copy-to-clipboard';
import bytes from 'bytes';
import { Fragment, ReactNode, RefObject, useEffect, useMemo, useRef, useState } from 'react';

import { jsx, Stack, useTheme, Text, VisuallyHidden } from '@keystone-ui/core';
import { useToasts } from '@keystone-ui/toast';
import { TextInput } from '@keystone-ui/fields';

import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { Pill } from '@keystone-ui/pill';
import { Button } from '@keystone-ui/button';
import { FieldProps } from '../../../../types';
import { parseImageRef } from '../utils';
import { ImageValue } from './index';

function useObjectURL(fileData: File | undefined) {
  let [objectURL, setObjectURL] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (fileData) {
      let url = URL.createObjectURL(fileData);
      setObjectURL(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [fileData]);
  return objectURL;
}

const RefView = ({
  field,
  onChange,
  onCancel,
  error,
}: {
  field: any;
  onChange: (value: string) => void;
  onCancel: () => void;
  error?: string;
}) => {
  return (
    <Fragment>
      <VisuallyHidden htmlFor={`${field.path}--ref-input`} as="label">
        {'Paste the image ref here'}
      </VisuallyHidden>
      <Stack
        gap="small"
        across
        css={{
          width: '100%',
          justifyContent: 'space-between',
          'div:first-of-type': {
            flex: '2',
          },
        }}
      >
        <TextInput
          id={`${field.path}--ref-input`}
          autoFocus
          placeholder="Paste the image ref here"
          onChange={event => {
            onChange(event.target.value);
          }}
          css={{
            width: '100%',
          }}
        />
        <Button tone="passive" onClick={onCancel}>
          Cancel
        </Button>
        {error ? (
          <Pill weight="light" tone="negative">
            {error}
          </Pill>
        ) : null}
      </Stack>
    </Fragment>
  );
};

export function Field({
  autoFocus,
  field,
  value,
  forceValidation,
  onChange,
}: FieldProps<typeof import('.').controller>) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const errorMessage = createErrorMessage(value, forceValidation);

  const onUploadChange = ({
    currentTarget: { validity, files },
  }: React.SyntheticEvent<HTMLInputElement>) => {
    const file = files?.[0];
    if (!file) return; // bail if the user cancels from the file browser
    onChange?.({
      kind: 'upload',
      data: { file, validity },
      previous: value,
    });
  };

  // Generate a random input key when the value changes, to ensure the file input is unmounted and
  // remounted (this is the only way to reset its value and ensure onChange will fire again if
  // the user selects the same file again)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const inputKey = useMemo(() => Math.random(), [value]);

  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      {value.kind === 'ref' ? (
        <RefView
          field={field}
          onChange={ref => {
            onChange?.({
              kind: 'ref',
              data: { ref },
              previous: value.previous,
            });
          }}
          error={forceValidation && errorMessage ? errorMessage : undefined}
          onCancel={() => {
            onChange?.(value.previous);
          }}
        />
      ) : (
        <ImgView
          errorMessage={errorMessage}
          value={value}
          onChange={onChange}
          field={field}
          inputRef={inputRef}
        />
      )}
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
      />
    </FieldContainer>
  );
}

function ImgView({
  errorMessage,
  value,
  onChange,
  field,
  inputRef,
}: {
  errorMessage?: string;
  value: Exclude<ImageValue, { kind: 'ref' }>;
  onChange?: (value: ImageValue) => void;
  field: ReturnType<typeof import('.').controller>;
  inputRef: RefObject<HTMLInputElement>;
}) {
  const { addToast } = useToasts();

  const imagePathFromUpload = useObjectURL(
    errorMessage === undefined && value.kind === 'upload' ? value.data.file : undefined
  );
  const onSuccess = () => {
    addToast({ title: 'Copied image ref to clipboard', tone: 'positive' });
  };
  const onFailure = () => {
    addToast({ title: 'Failed to copy image ref to clipboard', tone: 'negative' });
  };

  const copyRef = () => {
    if (value.kind !== 'from-server') {
      return;
    }

    if (navigator) {
      // use the new navigator.clipboard API if it exists
      navigator.clipboard.writeText(value?.data.ref).then(onSuccess, onFailure);
      return;
    } else {
      // Fallback to a library that leverages document.execCommand
      // for browser versions that dont' support the navigator object.
      // As document.execCommand
      try {
        copy(value?.data.ref);
      } catch (e) {
        addToast({ title: 'Faild to oopy to clipboard', tone: 'negative' });
      }

      return;
    }
  };
  return value.kind === 'from-server' || value.kind === 'upload' ? (
    <Stack gap="small" across align="center">
      {errorMessage === undefined ? (
        value.kind === 'from-server' ? (
          <ImageWrapper>
            <img css={{ width: '100%' }} src={value.data.src} alt={field.path} />
          </ImageWrapper>
        ) : (
          <ImageWrapper>
            <img
              css={{
                height: 'auto',
                maxWidth: '100%',
              }}
              src={imagePathFromUpload}
              alt={field.path}
            />
          </ImageWrapper>
        )
      ) : null}
      {onChange && (
        <Stack gap="small">
          {value.kind === 'from-server' && (
            <Stack padding="xxsmall" gap="xxsmall">
              <Stack across align="center" gap="small">
                <Text size="small">
                  <a href={value.data.src} target="_blank">
                    {`${value.data.id}.${value.data.extension}`}
                  </a>
                </Text>
                <Button size="small" tone="passive" onClick={copyRef}>
                  Copy Ref
                </Button>
              </Stack>
              <Text size="xsmall">{`${value.data.width} x ${value.data.height} (${bytes(
                value.data.filesize
              )})`}</Text>
            </Stack>
          )}
          <Stack across gap="small" align="center">
            <Button
              size="small"
              onClick={() => {
                inputRef.current?.click();
              }}
            >
              Change
            </Button>
            {value.kind !== 'upload' ? (
              <Button
                size="small"
                tone="passive"
                onClick={() => {
                  onChange({
                    kind: 'ref',
                    data: { ref: '' },
                    previous: value,
                  });
                }}
              >
                Paste Ref
              </Button>
            ) : null}
            {value.kind === 'from-server' && (
              <Button
                size="small"
                tone="negative"
                onClick={() => {
                  onChange({ kind: 'remove', previous: value });
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
                  onChange(value.previous);
                }}
              >
                Cancel
              </Button>
            )}
            {errorMessage ? (
              <Pill tone="negative" weight="light">
                {errorMessage}
              </Pill>
            ) : (
              value.kind === 'upload' && (
                <Pill weight="light" tone="positive">
                  Save to upload this image
                </Pill>
              )
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
            inputRef.current?.click();
          }}
          tone="positive"
        >
          Upload Image
        </Button>
        <Button
          size="small"
          tone="passive"
          disabled={onChange === undefined}
          onClick={() => {
            onChange?.({
              kind: 'ref',
              data: {
                ref: '',
              },
              previous: value,
            });
          }}
        >
          Paste Ref
        </Button>
        {value.kind === 'remove' && value.previous && (
          <Button
            size="small"
            tone="negative"
            onClick={() => {
              if (value.previous !== undefined) {
                onChange?.(value?.previous);
              }
            }}
          >
            Undo removal
          </Button>
        )}
        {value.kind === 'remove' &&
          // NOTE -- UX decision is to not display this, I think it would only be relevant
          // for deleting uploaded images (and we don't support that yet)
          // <Pill weight="light" tone="warning">
          //   Save to remove this image
          // </Pill>
          null}
      </Stack>
    </Stack>
  );
}

export function validateRef({ ref }: { ref: string }) {
  if (!parseImageRef(ref)) {
    return 'Invalid ref';
  }
}

function createErrorMessage(value: ImageValue, forceValidation?: boolean) {
  if (value.kind === 'upload') {
    return validateImage(value.data);
  } else if (value.kind === 'ref') {
    return forceValidation ? validateRef(value.data) : undefined;
  }
}

export function validateImage({
  file,
  validity,
}: {
  file: File;
  validity: ValidityState;
}): string | undefined {
  if (!validity.valid) {
    return 'Something went wrong, please reload and try again.';
  }
  // check if the file is actually an image
  if (!file.type.includes('image')) {
    return 'Only image files are allowed. Please try again.';
  }
}

// ==============================
// Styled Components
// ==============================

export const ImageWrapper = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <div
      css={{
        backgroundColor: 'white',
        borderRadius: theme.radii.medium,
        border: `1px solid ${theme.colors.border}`,
        flexShrink: 0,
        lineHeight: 0,
        padding: 4,
        position: 'relative',
        textAlign: 'center',
        width: '130px', // 120px image + chrome
      }}
    >
      {children}
    </div>
  );
};

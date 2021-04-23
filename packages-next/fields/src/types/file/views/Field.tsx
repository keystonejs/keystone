/** @jsx jsx */
import { Fragment, useMemo, useRef, RefObject } from 'react';
import copy from 'copy-to-clipboard';
import bytes from 'bytes';

import { jsx, Stack, Text } from '@keystone-ui/core';
import { useToasts } from '@keystone-ui/toast';
import { FieldContainer, FieldLabel } from '@keystone-ui/fields';

import { TextInput } from '@keystone-ui/fields';
import { parseFileRef } from '@keystone-next/utils-legacy';
import { Pill } from '@keystone-ui/pill';
import { Button } from '@keystone-ui/button';
import { FieldProps } from '@keystone-next/types';

import { FileValue } from './index';

export function validateRef({ ref }: { ref: string }) {
  if (!parseFileRef(ref)) {
    return 'Invalid ref';
  }
}

const RefView = ({
  onChange,
  onCancel,
  error,
}: {
  onChange: (value: string) => void;
  onCancel: () => void;
  error?: string;
}) => {
  return (
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
  const inputKey = useMemo(() => Math.random(), [value]);

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {value.kind === 'ref' ? (
        <RefView
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
        <FileView
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

function FileView({
  errorMessage,
  value,
  onChange,
  inputRef,
}: {
  errorMessage?: string;
  value: Exclude<FileValue, { kind: 'ref' }>;
  onChange?: (value: FileValue) => void;
  inputRef: RefObject<HTMLInputElement>;
}) {
  const { addToast } = useToasts();

  // const imagePathFromUpload = useObjectURL(
  //   errorMessage === undefined && value.kind === 'upload' ? value.data.file : undefined
  // );
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
      {/* {errorMessage === undefined ? (
        value.kind === 'from-server' ? (
          <ImageWrapper>
            <NextImage
              height={value.data.height}
              width={value.data.width}
              src={value.data.src}
              alt={field.path}
            />
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
      ) : null} */}
      {onChange && (
        <Fragment>
          {value.kind === 'from-server' && (
            <Stack padding="xxsmall" gap="xxsmall">
              <Stack across align="center" gap="small">
                <Text size="medium">
                  <a href={value.data.src} target="_blank">
                    {`${value.data.name}`}
                  </a>
                </Text>
                <Button size="small" tone="passive" onClick={copyRef}>
                  Copy
                </Button>
              </Stack>
              <Text size="xsmall">{bytes(value.data.filesize)}</Text>
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
                Paste
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
                  Save to upload this file
                </Pill>
              )
            )}
          </Stack>
        </Fragment>
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
          Upload File
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

function createErrorMessage(value: FileValue, forceValidation?: boolean) {
  if (value.kind === 'upload') {
    return validateFile(value.data);
  } else if (value.kind === 'ref') {
    return forceValidation ? validateRef(value.data) : undefined;
  }
}

export function validateFile({ validity }: { validity: ValidityState }): string | undefined {
  if (!validity.valid) {
    return 'Something went wrong, please reload and try again.';
  }
  //   // check if the file is actually an image
  //   if (!file.type.includes('image')) {
  //     return 'Only image files are allowed. Please try again.';
  //   }
}

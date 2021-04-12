/** @jsx jsx */

import { jsx, Stack, useTheme } from '@keystone-ui/core';
import { useToasts } from '@keystone-ui/toast';
import { TextInput } from '@keystone-ui/fields';
import copy from 'copy-to-clipboard';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { Pill } from '@keystone-ui/pill';
import { Button } from '@keystone-ui/button';
import { FieldProps } from '@keystone-next/types';
import NextImage from '@keystone-next/admin-ui/image';

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

export function Field({
  autoFocus,
  field,
  value,
  forceValidation,
  onChange,
}: FieldProps<typeof import('.').controller>) {
  const { addToast } = useToasts();
  const [canSetRef, setSetRef] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previousFile, setPrevious] = useState<ImageValue | null>(null);

  const errorMessage = createErrorMessage(value, forceValidation);
  console.log(forceValidation, errorMessage);

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

  const onRefChange = ({
    currentTarget: { value: eventValue },
  }: React.SyntheticEvent<HTMLInputElement>) => {
    onChange?.({
      kind: 'ref',
      data: {
        ref: eventValue,
      },
    });
  };

  const imagePathFromUpload = useObjectURL(
    errorMessage === undefined && value.kind === 'upload' ? value.data.file : undefined
  );

  // Generate a random input key when the value changes, to ensure the file input is unmounted and
  // remounted (this is the only way to reset its value and ensure onChange will fire again if
  // the user selects the same file again)
  const inputKey = useMemo(() => Math.random(), [value]);

  const onSuccess = () => {
    addToast({ title: 'Copied image ref to clipboard', tone: 'positive' });
  };
  const onFailure = () => {
    addToast({ title: 'Faild to copy image ref to clipboard', tone: 'negative' });
  };

  const toggleSetRefUI = () => {
    if (value.kind === 'from-server') {
      setPrevious(value);
    }
    setSetRef(!canSetRef);
  };

  const copyRef = () => {
    if ((value.kind !== 'from-server' && value.kind !== 'ref') || typeof window === 'undefined') {
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

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {canSetRef ? (
        <Stack gap="small">
          <TextInput
            placeholder="Paste the image ref here"
            value={value?.data?.ref}
            onChange={onRefChange}
          />
          <Stack gap="small" across>
            <Button
              tone="negative"
              onClick={() => {
                setSetRef(false);
                console.log('previousFile', previousFile);
                if (value.kind === 'from-server') return;
                if (previousFile) {
                  // if value.kind === 'from-server' save state
                  return onChange?.({ kind: 'remove', previous: previousFile });
                }
                return onChange?.({ kind: 'remove' });
              }}
            >
              Cancel
            </Button>
            {forceValidation && errorMessage ? (
              <Pill weight="light" tone="negative">
                {errorMessage}
              </Pill>
            ) : null}
          </Stack>
        </Stack>
      ) : value.kind === 'from-server' || value.kind === 'upload' ? (
        <Stack gap="small">
          {errorMessage === undefined ? (
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
          ) : null}
          {onChange && (
            <Stack across gap="small" align="center">
              <Button
                size="small"
                onClick={() => {
                  setSetRef(false);
                  inputRef.current?.click();
                }}
              >
                Change image
              </Button>
              {value.kind !== 'upload' ? (
                <Button size="small" tone="passive" onClick={toggleSetRefUI}>
                  {'Set From Ref'}
                </Button>
              ) : null}
              {value.kind === 'from-server' && (
                <Stack across gap="small">
                  <Button size="small" tone="passive" onClick={copyRef}>
                    Copy Ref
                  </Button>
                  <Button
                    size="small"
                    tone="negative"
                    onClick={() => {
                      setSetRef(false);
                      onChange({ kind: 'remove', previous: value });
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              )}
              {value.kind === 'upload' && (
                <Button
                  size="small"
                  tone="negative"
                  onClick={() => {
                    setSetRef(false);
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
          )}
          {}
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
            >
              Upload Image
            </Button>
            {!canSetRef && (
              <Button size="small" tone="passive" onClick={toggleSetRefUI}>
                {'Set from Ref'}
              </Button>
            )}

            {value.kind === 'remove' && value.previous && (
              <Button
                size="small"
                tone="negative"
                onClick={() => {
                  setSetRef(false);
                  onChange?.(value.previous);
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

export function validateRef({ ref }: { ref: string }) {
  if (!/(local|cloud):(.+)\.(gif|jpg|png|jpeg)$/.test(ref)) {
    return 'Invalid ref';
  }
}

function createErrorMessage(value: ImageValue, forceValidation: boolean) {
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

const ImageWrapper = ({ children }: { children: ReactNode }) => {
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
        width: 130, // 120px image + chrome
      }}
    >
      {children}
    </div>
  );
};

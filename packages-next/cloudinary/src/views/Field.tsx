/** @jsx jsx */

import { jsx, Stack, useTheme } from '@keystone-ui/core';
import { useEffect, useRef, useState } from 'react';

import { FieldContainer, FieldLabel } from '@keystone-ui/fields';
import { Pill } from '@keystone-ui/pill';
import { Button } from '@keystone-ui/button';
import { FieldProps } from '@keystone-next/types';

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
  onChange,
}: FieldProps<typeof import('.').controller>) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const errorMessage = value.kind === 'upload' ? validateImage(value.data) : undefined;

  const imagePathFromUpload = useObjectURL(
    errorMessage === undefined && value.kind === 'upload' ? value.data.file : undefined
  );
  const imagePath =
    value.kind === 'from-server' ? value.data.publicUrlTransformed : imagePathFromUpload;

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {value.kind === 'from-server' || value.kind === 'upload' ? (
        <Stack gap="small">
          {imagePath && errorMessage === undefined && <Image src={imagePath} alt={field.path} />}
          <Stack across gap="small">
            <Button
              disabled={onChange === undefined}
              onClick={() => {
                inputRef.current?.click();
              }}
            >
              Change Image
            </Button>
            {value.kind === 'from-server' && (
              <Button
                disabled={onChange === undefined}
                tone="negative"
                onClick={() => {
                  onChange?.({ kind: 'remove', previous: value });
                }}
              >
                Remove
              </Button>
            )}
            {value.kind === 'upload' && (
              <Button
                disabled={onChange === undefined}
                tone="negative"
                onClick={() => {
                  onChange?.(value.previous);
                }}
              >
                Cancel
              </Button>
            )}
          </Stack>
          {errorMessage ? (
            <Pill tone="negative" weight="bold">
              {errorMessage}
            </Pill>
          ) : (
            value.kind === 'upload' && <Pill>Save to upload this image</Pill>
          )}
        </Stack>
      ) : (
        <Stack css={{ alignItems: 'center' }} gap="small" across>
          <Button
            disabled={onChange === undefined}
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            Upload Image
          </Button>
          {value.kind === 'remove' && (
            <Button
              tone="negative"
              onClick={() => {
                onChange?.(value.previous);
              }}
            >
              Undo removal
            </Button>
          )}
          {value.kind === 'remove' && <Pill>Save to remove this image</Pill>}
        </Stack>
      )}

      <input
        css={{ display: 'none' }}
        autoComplete="off"
        autoFocus={autoFocus}
        ref={inputRef}
        name={field.path}
        onChange={({ target: { validity, files } }) => {
          const file = files?.[0];
          if (!file) return; // bail if the user cancels from the file browser
          onChange?.({
            kind: 'upload',
            data: { file, validity },
            previous: value,
          });
        }}
        type="file"
        disabled={onChange === undefined}
      />
    </FieldContainer>
  );
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

const Image = (props: { src: string; alt: string }) => {
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
      <img
        css={{
          height: 'auto',
          maxWidth: '100%',
        }}
        {...props}
      />
    </div>
  );
};

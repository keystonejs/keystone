import { Stack } from '@keystone-ui/core';
import React, { useState } from 'react';
import { Button as KeystoneUIButton } from '@keystone-ui/button';
import { PreviewProps } from './api';
import {
  FormValueContentFromPreviewProps,
  NonChildFieldComponentSchema,
} from './form-from-preview';

export function FormValue({
  onClose,
  props,
  isValid,
}: {
  props: PreviewProps<NonChildFieldComponentSchema>;
  onClose(): void;
  isValid: boolean;
}) {
  const [forceValidation, setForceValidation] = useState(false);

  return (
    <Stack gap="xlarge" contentEditable={false}>
      <FormValueContentFromPreviewProps {...props} forceValidation={forceValidation} />
      <KeystoneUIButton
        size="small"
        tone="active"
        weight="bold"
        onClick={() => {
          if (isValid) {
            onClose();
          } else {
            setForceValidation(true);
          }
        }}
      >
        Done
      </KeystoneUIButton>
    </Stack>
  );
}

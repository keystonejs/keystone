/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react';
import { InputHTMLAttributes } from 'react';
import { Stack } from './Stack';
import { Type } from './Type';

export const Field = ({
  label,
  id,
  disabled,
  type = 'text',
  ...props
}: InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & {
  label?: string;
  id?: string;
}) => {
  const isTextarea = type === 'comments';
  const TextInput = isTextarea ? 'textarea' : 'input';

  return (
    <Stack
      css={{
        width: '100%',
      }}
    >
      {label && (
        <Type look="body14" as="label" htmlFor={id}>
          {label}
        </Type>
      )}

      <TextInput
        type={type}
        id={id}
        css={{
          appearance: 'none',
          backgroundColor: 'var(--app-bg)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          color: 'var(--text)',
          fontSize: '1rem',
          fontWeight: 400,
          outline: 0,
          paddingLeft: '1rem',
          paddingRight: '1rem',
          textAlign: 'inherit',
          width: '100%',
          height: '2.5rem',
          lineHeight: 1,
          paddingBottom: 0,
          paddingTop: 0,
          boxShadow: '0 0 0 2px transparent',
          transition: 'border 0.1s ease, box-shadow 0.1s ease',
          ...(isTextarea && {
            fontFamily: 'inherit',
            paddingTop: '0.75rem',
            height: '8rem',
          }),
          ':hover': {
            borderColor: 'var(--brand-bg)',
          },
          ':focus': {
            borderColor: 'var(--focus)',
            boxShadow: '0 0 0 2px var(--focus)',
          },
          ':disabled': {
            cursor: 'not-allowed',
            background: 'var(--border)',
            color: 'var(--code)',
            pointerEvents: 'none',
          },
        }}
        aria-disabled={disabled ? true : undefined}
        disabled={disabled}
        {...props}
      />
    </Stack>
  );
};

Field.displayName = 'Field';

/** @jsx jsx */

import { jsx } from '@emotion/core';
import React from 'react';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Popout from '@arch-ui/popout';
import { Button } from '@arch-ui/button';
import SketchPicker from 'react-color/lib/Sketch';

const ColorField = ({ field, value: serverValue, errors, onChange }) => {
  const value = serverValue || '';
  const htmlID = `ks-input-${field.path}`;

  const target = props => (
    <Button {...props} variant="ghost">
      {value ? (
        <React.Fragment>
          <div
            style={{
              // using inline styles instead of emotion for setting the color
              // since emotion doesn't escape styles so it could be used for CSS injection
              // this is also better in terms of memory since the value can change a lot
              // and emotion caches everything
              backgroundColor: value,
            }}
            css={{
              borderRadius: 3,
              display: 'inline-block',
              height: 18,
              width: 18,
              marginRight: 10,
              verticalAlign: 'middle',
            }}
          />
          <span
            css={{
              verticalAlign: 'middle',
            }}
          >
            {value}
          </span>
        </React.Fragment>
      ) : (
        'Set Color'
      )}
    </Button>
  );

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldInput>
        <Popout width={220} target={target}>
          <SketchPicker
            css={{
              // using !important because react-color uses inline styles and applies a box shadow
              // but Popout already applies a box shadow
              boxShadow: 'none !important',
            }}
            noAlpha
            color={value}
            onChange={({ hex }) => {
              onChange(hex);
            }}
          />
        </Popout>
      </FieldInput>
    </FieldContainer>
  );
};

export default ColorField;

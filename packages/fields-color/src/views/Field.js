/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useMemo } from 'react';
import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import Popout from '@arch-ui/popout';
import { Button } from '@arch-ui/button';
import convert from 'tinycolor2';
import { RgbaStringColorPicker } from 'react-colorful';
import 'react-colorful/dist/index.css';

const ColorField = ({ field, value, errors, onChange, isDisabled }) => {
  const htmlID = `ks-input-${field.path}`;

  const colorPickerValue = useMemo(() => {
    // keystone previously stored values as a hex string and this should still be supported
    // it is now stored as an rgba string
    if (value && value.indexOf('rgba') !== 0) return convert(value).toRgbString();
    // the color that picker shows if no value passed
    return value || 'rgba(0, 0, 0, 1)';
  }, [value]);

  const target = props => (
    <Button {...props} variant="ghost" isDisabled={isDisabled}>
      {value ? (
        <Fragment>
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
        </Fragment>
      ) : (
        'Set Color'
      )}
    </Button>
  );

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID} field={field} errors={errors} />
      <FieldDescription text={field.adminDoc} />
      <FieldInput>
        <Popout width="auto" target={target}>
          <RgbaStringColorPicker
            css={{
              padding: 12,
            }}
            color={colorPickerValue}
            onChange={onChange}
          />
        </Popout>
      </FieldInput>
    </FieldContainer>
  );
};

export default ColorField;

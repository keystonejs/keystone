/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useMemo } from 'react';
import { FieldContainer, FieldLabel, FieldDescription, FieldInput } from '@arch-ui/fields';
import Popout from '@arch-ui/popout';
import { Button } from '@arch-ui/button';
import SketchPicker from 'react-color/lib/Sketch';

const ColorField = ({ field, value = '', errors, onChange, isDisabled }) => {
  const htmlID = `ks-input-${field.path}`;

  const colorPickerValue = useMemo(() => {
    // keystone previously stored values as a hex string and this should still be supported
    // it is now stored as an rgba string
    if (value) {
      if (value.indexOf('rgba', 0) === 0) {
        const rgbaValues = value.replace(/^rgba\(|\s+|\)$/g, '').split(',');
        return { r: rgbaValues[0], g: rgbaValues[1], b: rgbaValues[2], a: rgbaValues[3] };
      }
      return value;
    }
    return '';
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
        <Popout width={220} target={target}>
          <SketchPicker
            css={{
              // using !important because react-color uses inline styles and applies a box shadow
              // but Popout already applies a box shadow
              boxShadow: 'none !important',
            }}
            presetColors={[]}
            color={colorPickerValue}
            onChange={({ rgb: { r, g, b, a } }) => {
              onChange(`rgba(${r}, ${g}, ${b}, ${a})`);
            }}
          />
        </Popout>
      </FieldInput>
    </FieldContainer>
  );
};

export default ColorField;

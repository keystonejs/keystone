/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useCallback, useMemo } from 'react';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Popout from '@arch-ui/popout';
import { Button } from '@arch-ui/button';
import SketchPicker from 'react-color/lib/Sketch';

const ColorField = ({ field, value: serverValue, errors, onChange }) => {
  const htmlID = `ks-input-${field.path}`;

  const value = useMemo(() => {
    // keystone previously stored values as a hex string and this should still be supported
    // it is now stored as a JSON stringified object containing the rgba values
    if (serverValue) {
      try {
        const parsedValue = JSON.parse(serverValue);
        return parsedValue;
      } catch (e) {
        return { hex: serverValue };
      }
    }
    return '';
  }, [serverValue]);

  const displayValue = useMemo(() => {
    if (value.rgba) {
      const { r, g, b, a } = value.rgba;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    if (value.hex) {
      return value.hex;
    }
    return value;
  }, [value]);

  const handleColorChange = useCallback(
    ({ rgb }) => {
      // react-color sends the 'rgba' value as 'rgb'
      onChange(JSON.stringify({ rgba: rgb }));
    },
    [onChange]
  );

  const target = props => (
    <Button {...props} variant="ghost">
      {typeof value === 'object' ? (
        <Fragment>
          <div
            style={{
              // using inline styles instead of emotion for setting the color
              // since emotion doesn't escape styles so it could be used for CSS injection
              // this is also better in terms of memory since the value can change a lot
              // and emotion caches everything
              backgroundColor: displayValue,
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
            {displayValue}
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
      <FieldInput>
        <Popout width={220} target={target}>
          <SketchPicker
            css={{
              // using !important because react-color uses inline styles and applies a box shadow
              // but Popout already applies a box shadow
              boxShadow: 'none !important',
            }}
            presetColors={[]}
            color={value.rgba || value.hex}
            onChange={handleColorChange}
          />
        </Popout>
      </FieldInput>
    </FieldContainer>
  );
};

export default ColorField;

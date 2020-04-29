/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState } from 'react';
import styled from '@emotion/styled';

import { colors } from '@arch-ui/theme';
import { FlexGroup } from '@arch-ui/layout';
import { LoadingIndicator, LoadingSpinner } from '@arch-ui/loading';

const LoadingBox = styled.div(({ on, size }) => ({
  alignItems: 'center',
  background: on ? colors.text : null,
  borderRadius: 2,
  display: 'flex',
  justifyContent: 'center',
  height: size * 6,
  width: size * 8,
}));

const appearances = ['default', 'dark', 'primary', 'inverted'];

const ProgressGuide = () => {
  const [appearance, setAppearance] = useState('default');
  const [size, setSize] = useState(8);

  const handleAppearance = ({ target: { value } }) => {
    setAppearance(value);
  };

  const handleSize = ({ target: { value } }) => {
    setSize(parseInt(value, 10));
  };

  return (
    <Fragment>
      <h2>Loading</h2>
      <FlexGroup style={{ marginBottom: '1em' }}>
        <div css={{ alignItems: 'center', display: 'flex' }}>
          <input type="range" min="4" max="16" value={size} onChange={handleSize} />
        </div>
        <div>
          {appearances.map(a => (
            <label key={a} css={{ padding: '0.5em' }}>
              <input
                type="radio"
                name="appearance"
                value={a}
                onChange={handleAppearance}
                checked={a === appearance}
              />
              <code css={{ marginLeft: '0.25em' }}>{a}</code>
            </label>
          ))}
        </div>
      </FlexGroup>
      <FlexGroup>
        <div css={{ height: 120 }}>
          <h4 css={{ marginBottom: 4, marginTop: 0 }}>Indicator</h4>
          <LoadingBox size={size} on={appearance === 'inverted'}>
            <LoadingIndicator size={size} appearance={appearance} />
          </LoadingBox>
        </div>
        <div css={{ height: 120 }}>
          <h4 css={{ marginBottom: 4, marginTop: 0 }}>Spinner</h4>
          <LoadingBox size={size} on={appearance === 'inverted'}>
            <LoadingSpinner size={size * 3} appearance={appearance} />
          </LoadingBox>
        </div>
      </FlexGroup>
    </Fragment>
  );
};

export default ProgressGuide;

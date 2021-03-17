/* @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';

import { Fragment } from 'react';
import { Page } from '../../components/Page';
import { ReadableColor } from '../../components/ReadableColor';

const PALETTES = [
  'neutral',
  'blue',
  'cyan',
  'teal',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
];

const PALETTE_RANGE = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

const Palette = ({ name }: { name: string }) => {
  const { palette, spacing, radii, typography } = useTheme();

  return (
    <div css={{ position: 'relative', marginLeft: `-${spacing.medium}px` }}>
      {PALETTE_RANGE.map(i => {
        const color = `${name}${i}` as keyof typeof palette;
        return (
          <div
            key={i}
            css={{
              display: 'inline-block',
              padding: spacing.medium,
              margin: spacing.small,
              fontSize: typography.fontSize.xsmall,
              fontFamily: typography.fontFamily.monospace,
              textAlign: 'center',
              backgroundColor: palette[color],
              width: 100,
              borderRadius: radii.medium,
            }}
          >
            <ReadableColor background={palette[color]}>
              {name}
              {i}
            </ReadableColor>
          </div>
        );
      })}
    </div>
  );
};

export default function ThemePage() {
  return (
    <Page>
      <h1>Theme</h1>

      <h2>Palette</h2>
      <p>
        The palette is used as a global set of available colours in the theme, but should rarely be
        applied directly to elements. Selections from the palette are mapped to alias tokens.
      </p>

      {PALETTES.map(name => (
        <Fragment>
          <h3>{name}</h3>
          <Palette name={name} key={name} />
        </Fragment>
      ))}
    </Page>
  );
}

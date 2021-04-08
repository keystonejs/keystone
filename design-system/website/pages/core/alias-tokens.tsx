/* @jsx jsx */

import { jsx, useTheme, Inline } from '@keystone-ui/core';

import { Fragment } from 'react';
import { Page } from '../../components/Page';
import { ReadableColor } from '../../components/ReadableColor';

type SelectableColorType = keyof ReturnType<typeof useTheme>['selectableColors'];

const SelectableColor = ({ name }: { name: SelectableColorType }) => {
  const { selectableColors, spacing, radii, typography } = useTheme();
  const color = selectableColors[name];
  return (
    <div>
      <div
        css={{
          display: 'inline-block',
          padding: spacing.medium,
          fontSize: typography.fontSize.xsmall,
          fontFamily: typography.fontFamily.monospace,
          textAlign: 'center',
          backgroundColor: color.fill,
          color: color.fillForeground,
          width: 100,
          borderTopLeftRadius: radii.medium,
          borderBottomLeftRadius: radii.medium,
        }}
      >
        {name}
      </div>
      <div
        css={{
          display: 'inline-block',
          padding: spacing.medium,
          fontSize: typography.fontSize.xsmall,
          fontFamily: typography.fontFamily.monospace,
          textAlign: 'center',
          backgroundColor: color.tint,
          color: color.foreground,
          width: 100,
          borderTopRightRadius: radii.medium,
          borderBottomRightRadius: radii.medium,
        }}
      >
        {name}
      </div>
    </div>
  );
};

type ToneType = keyof ReturnType<typeof useTheme>['tones'];

const Tone = ({ name }: { name: ToneType }) => {
  const { tones, spacing, radii, typography } = useTheme();
  const color = tones[name];
  return (
    <div>
      <div
        css={{
          display: 'inline-block',
          padding: spacing.medium,
          fontSize: typography.fontSize.xsmall,
          fontFamily: typography.fontFamily.monospace,
          textAlign: 'center',
          backgroundColor: color.fill[0],
          color: color.fillForeground[0],
          width: 100,
          borderTopLeftRadius: radii.medium,
          borderBottomLeftRadius: radii.medium,
        }}
      >
        Fill
      </div>
      <div
        css={{
          display: 'inline-block',
          padding: spacing.medium,
          fontSize: typography.fontSize.xsmall,
          fontFamily: typography.fontFamily.monospace,
          textAlign: 'center',
          backgroundColor: color.tint[0],
          color: color.foreground[0],
          width: 100,
          borderTopRightRadius: radii.medium,
          borderBottomRightRadius: radii.medium,
          marginRight: 10,
        }}
      >
        Tint
      </div>
      <div
        css={{
          display: 'inline-block',
          padding: spacing.medium - 3,
          fontSize: typography.fontSize.xsmall,
          fontFamily: typography.fontFamily.monospace,
          textAlign: 'center',
          borderColor: color.border[0],
          borderWidth: '3px 3px 3px 3px',
          color: color.foreground[0],
          width: 100,
          borderRadius: radii.medium,
        }}
      >
        Border
      </div>
    </div>
  );
};

type ColorType = keyof ReturnType<typeof useTheme>['colors'];

const Color = ({ color }: { color: ColorType }) => {
  const { spacing, typography, colors, radii } = useTheme();
  return (
    <div
      css={{
        backgroundColor: colors[color],
        borderRadius: radii.medium,
        display: 'inline-block',
        fontFamily: typography.fontFamily.monospace,
        fontSize: typography.fontSize.xsmall,
        padding: spacing.medium,
        textAlign: 'center',
        minWidth: 100,
      }}
    >
      <ReadableColor background={colors[color]}>{color}</ReadableColor>
    </div>
  );
};

export default function ThemePage() {
  const { colors, tones, selectableColors } = useTheme();
  return (
    <Page>
      <h1>Alias Tokens</h1>

      <h2>Colors</h2>
      <p>These are the basic set of page colors.</p>
      <Inline gap="medium">
        {(Object.keys(colors) as (keyof typeof colors)[]).map(color => (
          <Color color={color} key={color} />
        ))}
      </Inline>

      <h2>Tones</h2>
      <p>
        Some components allow you to select a color that has semantic meaning and could be changed
        by the theme to another color.
      </p>
      {(Object.keys(tones) as (keyof typeof tones)[]).map(name => (
        <Fragment>
          <h3>{name}</h3>
          <Tone name={name} key={name} />
        </Fragment>
      ))}

      <h2>Selectable Colors</h2>
      <p>
        Some components allow you to select a color that has no semantic meaning (e.g Avatars,
        Badges, etc)
      </p>
      {(Object.keys(selectableColors) as (keyof typeof selectableColors)[]).map(name => (
        <Fragment>
          <h3>{name}</h3>
          <SelectableColor name={name} key={name} />
        </Fragment>
      ))}
    </Page>
  );
}

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';

import { Grid, Cell } from '@voussoir/ui/src/primitives/layout';
import { colors } from '@voussoir/ui/src/theme';

const Swatch = ({ color, name, prefix }) => (
  <div
    style={{ backgroundColor: color }}
    css={{
      borderRadius: 2,
      boxSizing: 'border-box',
      color: 'white',
      textShadow: '1px 1px 1px rgba(0,0,0,0.1)',
      fontWeight: 500,
      paddingBottom: '100%',
      position: 'relative',
    }}
  >
    <code css={{ position: 'absolute', left: 8, top: 8 }}>
      {prefix}.{name}
    </code>
  </div>
);

const Hue = ({ heading, group }) => {
  const groupList = Object.keys(group).reverse();
  return (
    <Fragment>
      <h4>{heading}</h4>
      <Grid>
        {groupList.map(k => {
          const clr = group[k];
          return (
            <Cell key={k}>
              <Swatch prefix={heading.slice(0, 1)} color={clr} name={k} />
            </Cell>
          );
        })}
      </Grid>
    </Fragment>
  );
};

const PaletteGuide = () => {
  return (
    <Fragment>
      <h2>Palette</h2>
      <Hue heading="Reds" group={colors.R} />
      <Hue heading="Greens" group={colors.G} />
      <Hue heading="Blues" group={colors.B} />
      <Hue heading="Yellows" group={colors.Y} />
    </Fragment>
  );
};

export default PaletteGuide;

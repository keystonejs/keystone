import React, { Fragment } from 'react';
import styled from '@emotion/styled';

import { Grid, Cell } from '@arch-ui/layout';

const GridBox = styled.div({
  alignItems: 'center',
  background: 'rgba(9, 30, 66, 0.04)',
  borderRadius: 2,
  boxShadow: 'inset 0 0 0 1px rgba(9, 30, 66, 0.04)',
  display: 'flex',
  justifyContent: 'center',
  height: 40,
});

const makeRow = width => (c, i, a) => (
  <Cell width={width} key={i}>
    <GridBox>
      {i + 1}/{a.length}
    </GridBox>
  </Cell>
);

const GridGuide = () => {
  const twelfths = new Array(12).fill('');
  const sixths = new Array(6).fill('');
  const quarters = new Array(4).fill('');
  const halves = new Array(2).fill('');

  return (
    <Fragment>
      <h2>Grid</h2>
      <h4>Traditional</h4>
      <Grid columns={12}>
        {twelfths.map(makeRow(1))}
        {sixths.map(makeRow(2))}
        {quarters.map(makeRow(3))}
        {halves.map(makeRow(6))}
      </Grid>
    </Fragment>
  );
};

export default GridGuide;

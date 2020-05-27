/** @jsx jsx */

import { jsx } from '@emotion/core';
import { FieldDescription } from '@arch-ui/fields';
import { CONTAINER_WIDTH } from '@arch-ui/layout';
import { gridSize } from '@arch-ui/theme';

const ListDescription = props => (
  <FieldDescription
    css={{
      fontSize: '0.95em',
      lineHeight: 1.6,
      maxWidth: `${CONTAINER_WIDTH}px`,
      marginBottom: `${gridSize * 2}px`,
    }}
    {...props}
  />
);

export default ListDescription;

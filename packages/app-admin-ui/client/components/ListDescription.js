import styled from '@emotion/styled';
import { FieldDescription } from '@arch-ui/fields';
import { CONTAINER_WIDTH } from '@arch-ui/layout';
import { gridSize } from '@arch-ui/theme';

const ListDescription = styled(FieldDescription)`
  font-size: 0.95em;
  line-height: 1.6;
  max-width: ${CONTAINER_WIDTH}px;
  margin-bottom: ${gridSize * 2}px;
`;

export default ListDescription;

import styled from '@emotion/styled';
import { colors, gridSize } from '../theme';
import { withSelector } from './misc';

export const FieldContainer = withSelector(
  'field-container',
  styled.div({
    display: 'flex',
    marginBottom: gridSize,
  })
);

export const FieldLabel = styled.label({
  color: colors.N60,
  paddingTop: gridSize,
  width: 180,
});

export const FieldInput = styled.div({
  width: 500,
});

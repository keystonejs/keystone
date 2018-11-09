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
  display: 'flex',
  width: 500,
});

export const Currency = styled.span({
  display: 'flex',
  alignContent: 'center',
  padding: 10,
  borderRadius: 4,
  borderBottomRightRadius: 0,
  borderTopRightRadius: 0,
  fontSize: '0.9rem',
  backgroundColor: colors.N10,
  border: '1px solid transparent',
  borderColor: colors.N20,
  borderRight: 0,
  marginRight: -2,
});

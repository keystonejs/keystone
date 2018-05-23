import styled from 'react-emotion';
import { colors } from '../theme';
import { withSelector } from './misc';

export const FieldContainer = withSelector(
  'field-container',
  styled.div({
    display: 'flex',
    marginBottom: 8,
  })
);

export const FieldLabel = styled.label({
  color: colors.N60,
  paddingTop: 8,
  width: 180,
});

export const FieldInput = styled.div({
  width: 500,
});

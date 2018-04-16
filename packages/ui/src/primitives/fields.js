import styled from 'react-emotion';
import { colors } from '../theme';

export const FieldContainer = styled.div({
  display: 'flex',
  marginBottom: 8,
});

export const FieldLabel = styled.div({
  color: colors.N60,
  paddingTop: 8,
  width: 180,
});

export const FieldInput = styled.div({
  width: 500,
});

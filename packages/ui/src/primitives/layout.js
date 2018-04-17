import styled from 'react-emotion';
import { smOnly } from './media-queries';

export const Container = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  maxWidth: 1160,
  paddingLeft: 30,
  paddingRight: 30,

  [smOnly]: {
    paddingLeft: 15,
    paddingRight: 15,
  },
});

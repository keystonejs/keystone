import Styled from '@emotion/styled';
import { colors } from '../styles';


{/* <Button appearance="dark" /> */}

export default Styled.a(props => ({
  textDecoration: 'none',
  boxSizing: 'border-box',
  fontSize: '1.25rem',
  padding: '1rem 2rem',
  borderRadius: 6,
  margin: '0.5rem',
  transition: 'transform linear 120ms',
  '&:hover': {
    transform: 'scale(1.025)',
  },
  '&:active': {
    opacity: 0.8,
  },

  border: props.appearance = 'Dark' ? `2px solid rgba(255,255,255,0.4);` : `2px solid ${colors.B.base}`,
  background: props.primary && props.appearance = 'Dark' ? 'white' : props.primary ? colors.B.base : 'none',

  color:
    props.primary && props.onDark
      ? colors.B.base
      : props.primary
      ? 'white'
      : props.onDark
      ? 'white'
      : colors.B.base,
}));

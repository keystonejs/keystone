import Styled from '@emotion/styled';
import { colors } from '@voussoir/ui/src/theme';

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

  border:
    props.appearance === 'primary-light'
      ? `2px solid rgba(255,255,255,0.6);`
      : `2px solid ${colors.B.base}`,

  background:
    {
      'primary-light': 'white',
      primary: colors.B.base,
    }[props.appearance] || 'none',

  color: props.appearance === 'primary' || props.appearance === 'light' ? 'white' : colors.B.base,
}));

// @flow

import styled from 'react-emotion';

export const Table = styled('table')({
  borderCollapse: 'collapse',
  borderSpacing: 0,
  tableLayout: 'fixed',
  width: '100%',
});

export const HeaderCell = styled('td')({
  borderBottom: '2px solid rgba(0, 0, 0, 0.06)',
  color: '#999',
  display: 'table-cell',
  fontWeight: 'normal',
  paddingBottom: '8px',
  textAlign: 'left',
  verticalAlign: 'bottom',
});

export const BodyCell = styled('td')({
  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  padding: '8px 0',
  fontSize: 15,
});

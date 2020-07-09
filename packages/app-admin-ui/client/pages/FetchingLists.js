/** @jsx jsx */
import { jsx } from '@emotion/core';

import { colors } from '@arch-ui/theme';
import { CloudDownloadIcon } from '@arch-ui/icons';
import { LoadingIndicator } from '@arch-ui/loading';

// TODO: this is duplicated (except color and fontSize) in the signin page.
// There's also another component called Container which could be confused
const Container = (props) => (
  <div
    css={{
      color: colors.N30,
      fontSize: 24,
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
    }}
    {...props}
  />
);

const FetchingListsPage = () => {
  return (
    <Container>
      <CloudDownloadIcon css={{ height: '48px', width: '48px' }} />
      <p>Fetching list data...</p>
      <LoadingIndicator css={{ height: '3em' }} size={12} />
    </Container>
  );
};

export default FetchingListsPage;

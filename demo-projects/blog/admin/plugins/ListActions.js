
import React, { useState } from 'react';
import { DesktopDownloadIcon } from '@arch-ui/icons';
import { IconButton } from '@arch-ui/button';
import { useQuery } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import { Button } from '@arch-ui/button';
import Confirm from '@arch-ui/confirm';
import PageLoading from '@keystone-alpha/app-admin-ui/client/components/PageLoading';


export default () => {
  const [showExportModal, toggleExportModal] = useState(false);

  const closeExportModal = () => {
    toggleExportModal(false);
  };
  const openExportModal = () => {
    toggleExportModal(true);
  };

  return (
    <>
      {showExportModal ? <DownloadModal isOpen onClose={closeExportModal} />  : null}
      <IconButton
        appearance="default"
        icon={DesktopDownloadIcon}
        onClick={openExportModal}
      >Export
      </IconButton>
    </>
  );
};

export const DownloadModal = ({ isOpen, onClose }) => {
  const { data, loading } = useQuery(gql`
    query {
      allPosts {
        id title slug posted body
      }
    }
  `);
  if(!loading && data && data.allPosts) {
    console.log(data.allPosts);
  }
  return (
    <Confirm
      isOpen={isOpen}
      onKeyDown={e => {
        if (e.key === 'Escape' && !loading) {
          onClose();
        }
      }}
    >
      {loading ? (<PageLoading />) :
        (<p style={{ marginTop: 0 }}>
          This is demo of plugin feature, see output in browser console, actual csv export may also be done
            </p>)
      }
      <footer>
        <Button
          // isDisabled={loading}
          variant="subtle"
          onClick={() => {
            if (loading) return;
            onClose();
          }}
        >
          Close
              </Button>
      </footer>
    </Confirm>
  );
};

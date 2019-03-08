import React, { Component } from 'react';

import ListPage from '../client/pages/List';
import { withAdminMeta } from '../client/providers/AdminMeta';
import ListNotFoundPage from '../client/pages/ListNotFound';

export default withAdminMeta(
  class extends Component {
    static getInitialProps({ query }) {
      return {
        listPath: query.listPath,
      };
    }

    render() {
      const { listPath, adminMeta } = this.props;
      const list = listPath ? adminMeta.getListByPath(listPath) : null;
      if (list) {
        const List = list.getComponent();
        return (
          <List>
            <ListPage list={list} />
          </List>
        );
      } else {
        return <ListNotFoundPage listKey={list.key} />;
      }
    }
  }
);

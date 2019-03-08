import React, { Component } from 'react';

import ItemPage from '../client/pages/Item';
import { withAdminMeta } from '../client/providers/AdminMeta';
import ListNotFoundPage from '../client/pages/ListNotFound';

export default withAdminMeta(
  class extends Component {
    static getInitialProps({ query }) {
      return {
        listPath: query.listPath,
        itemId: query.itemId,
      };
    }

    render() {
      const { listPath, itemId, adminMeta } = this.props;
      const list = listPath ? adminMeta.getListByPath(listPath) : null;
      if (list) {
        const List = list.getComponent();
        return (
          <List>
            <ItemPage list={list} itemId={itemId} />
          </List>
        );
      } else {
        return <ListNotFoundPage listKey={list.key} />;
      }
    }
  }
);

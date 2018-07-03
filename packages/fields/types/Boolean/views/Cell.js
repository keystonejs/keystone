import React, { Component } from 'react';

type Props = {
  field: Object,
  list: Object,
  data: Object,
  // Link: Component,
};
// NOTE: It looks like this we do not need to handle the Link component.
// Current implementation will wrap the cell in a LinkComponent if it is the first
// field so using it here is not reqired.
// See: admin-ui/client/components/ListTable.js:145,162.

export default class BooleanCellView extends Component<Props> {
  render() {
    const { data } = this.props;
    return <input type="checkbox" checked={data} disabled />;
  }
}

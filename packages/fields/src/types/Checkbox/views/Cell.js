import { Component } from 'react';

export default class CheckboxCellView extends Component {
  render() {
    const { data } = this.props;
    if (data === true) return 'Checked';
    if (data === false) return 'Unchecked';
    return 'Not set';
  }
}

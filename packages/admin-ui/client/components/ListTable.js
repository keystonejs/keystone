import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import DeleteItemModal from './DeleteItemModal';

import {
  BodyCell,
  HeaderCell,
  Table,
} from '@keystonejs/ui/src/primitives/tables';

class ListTableRow extends Component {
  state = {
    showDeleteModal: false,
  };
  componentDidMount() {
    this.mounted = true;
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  showDeleteModal = () => {
    this.setState({ showDeleteModal: true });
  };
  closeDeleteModal = () => {
    this.setState({ showDeleteModal: false });
  };
  onDelete = result => {
    if (this.props.onDelete) this.props.onDelete(result);
    if (!this.mounted) return;
    this.setState({ showDeleteModal: false });
  };
  renderDeleteModal() {
    const { showDeleteModal } = this.state;
    if (!showDeleteModal) return;

    const { item, list } = this.props;

    return (
      <DeleteItemModal
        item={item}
        list={list}
        onClose={this.closeDeleteModal}
        onDelete={this.onDelete}
      />
    );
  }
  render() {
    const { link, item, fields } = this.props;

    return (
      <tr>
        <BodyCell>
          <button onClick={this.showDeleteModal}>x</button>
          {this.renderDeleteModal()}
        </BodyCell>
        {fields.map(({ path }, index) => (
          <BodyCell key={path}>
            {!index ? <Link to={link}>{item[path]}</Link> : item[path]}
          </BodyCell>
        ))}
      </tr>
    );
  }
}

export default class ListTable extends Component {
  render() {
    const {
      adminPath,
      fields,
      items,
      list,
      noResultsMessage,
      onChange,
    } = this.props;

    return items.length ? (
      <Table>
        <colgroup>
          <col width="40" />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            {fields.map(({ label }, i) => (
              <HeaderCell colSpan={i ? 1 : 2} key={label}>
                {label}
              </HeaderCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <ListTableRow
              key={item.id}
              link={`${adminPath}/${list.path}/${item.id}`}
              list={list}
              fields={fields}
              item={item}
              onDelete={onChange}
            />
          ))}
        </tbody>
      </Table>
    ) : (
      noResultsMessage
    );
  }
}

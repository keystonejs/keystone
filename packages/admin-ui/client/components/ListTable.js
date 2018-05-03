import React, { Component } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

import { InfoIcon, TrashcanIcon } from '@keystonejs/icons';
import { colors } from '@keystonejs/ui/src/theme';
import DeleteItemModal from './DeleteItemModal';

// Styled Components

const Table = styled('table')({
  borderCollapse: 'collapse',
  borderSpacing: 0,
  tableLayout: 'fixed',
  width: '100%',
});
const HeaderCell = styled('td')({
  borderBottom: `2px solid ${colors.N10}`,
  color: '#999',
  display: 'table-cell',
  fontWeight: 'normal',
  paddingBottom: '8px',
  textAlign: 'left',
  verticalAlign: 'bottom',
});
const BodyCell = styled('td')({
  borderTop: `1px solid ${colors.N10}`,
  padding: '8px 0',
  fontSize: 15,
});

const NoResults = ({ children, ...props }) => (
  <div
    css={{
      alignItems: 'center',
      color: colors.N30,
      display: 'flex',
      flexDirection: 'column',
      fontSize: 32,
      justifyContent: 'center',
      padding: '1em',
    }}
    {...props}
  >
    <InfoIcon css={{ height: 48, width: 48, marginBottom: '0.5em' }} />
    {children}
  </div>
);

// Functional Components

class DeleteButton extends Component {
  state = {
    isHovered: false,
  };
  onMouseEnter = () => this.setState({ isHovered: true });
  onMouseLeave = () => this.setState({ isHovered: false });
  render() {
    const { onClick } = this.props;
    const { isHovered } = this.state;
    return (
      <div
        css={{
          color: isHovered ? colors.R.base : colors.N30,
          cursor: 'pointer',
          padding: '2px 4px',
          display: 'inline-block',
        }}
        onClick={onClick}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <TrashcanIcon width={16} height={16} />
      </div>
    );
  }
}

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
          <DeleteButton onClick={this.showDeleteModal} />
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
          <col width="32" />
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
      <NoResults>{noResultsMessage}</NoResults>
    );
  }
}

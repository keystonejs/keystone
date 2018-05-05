import React, { Component } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

import { InfoIcon, TrashcanIcon } from '@keystonejs/icons';
import { colors } from '@keystonejs/ui/src/theme';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { CheckboxPrimitive } from '@keystonejs/ui/src/primitives/forms';
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
const BodyCell = styled('td')(({ isSelected }) => ({
  backgroundColor: isSelected ? colors.B.L90 : null,
  boxShadow: isSelected
    ? `0 1px 0 ${colors.B.L75}, 0 -1px 0 ${colors.B.L75}`
    : `0 -1px 0 ${colors.N10}`,
  padding: '8px 0',
  position: isSelected ? 'relative' : null,
  fontSize: 15,
}));

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

class ListDisplayRow extends Component {
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
          <Button
            appearance="warning"
            onClick={this.showDeleteModal}
            spacing="cozy"
            variant="subtle"
            style={{ height: 24 }}
          >
            <TrashcanIcon />
          </Button>
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

function isKeyboardEvent(e) {
  return e.clientX === 0 && e.clientY === 0;
}

class ListManageRow extends Component {
  handleRowClick = e => {
    // bail when MouseClick on the actual input, which calls onClick twice
    if (e.target.nodeName === 'INPUT' && !isKeyboardEvent(e)) return;

    // trigger onClick with the current ID
    const { item, onClick } = this.props;
    onClick([item.id]);

    // make keyboard selection easier following a mouse select
    this.checkbox.focus();
  };
  getCheckbox = ref => {
    this.checkbox = ref;
  };
  render() {
    const { fields, isSelected, item } = this.props;

    return (
      <tr onClick={this.handleRowClick} css={{ cursor: 'default' }}>
        <BodyCell isSelected={isSelected} key="checkbox">
          <CheckboxPrimitive
            checked={isSelected}
            innerRef={this.getCheckbox}
            value={item.id}
            css={{ marginLeft: 1 }}
          />
        </BodyCell>
        {fields.map(({ path }) => (
          <BodyCell isSelected={isSelected} key={path}>
            {item[path]}
          </BodyCell>
        ))}
      </tr>
    );
  }
}

export default class ListTable extends Component {
  handleSelectAll = () => {
    const { items, onSelectAll, selectedItems } = this.props;
    const allSelected = items.length === selectedItems.length;
    const value = allSelected ? [] : items.map(i => i.id);
    onSelectAll(value);
  };
  render() {
    const {
      adminPath,
      fields,
      isManaging,
      items,
      list,
      noResultsMessage,
      onChange,
      onSelect,
      selectedItems,
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
            <HeaderCell>
              <div
                css={{
                  position: 'relative',
                  top: 3,
                  visibility: isManaging ? 'visible' : 'hidden',
                }}
              >
                <CheckboxPrimitive
                  checked={items.length === selectedItems.length}
                  onChange={this.handleSelectAll}
                />
              </div>
            </HeaderCell>
            {fields.map(({ label }) => (
              <HeaderCell key={label}>{label}</HeaderCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(
            item =>
              isManaging ? (
                <ListManageRow
                  fields={fields}
                  item={item}
                  key={item.id}
                  list={list}
                  isSelected={selectedItems.includes(item.id)}
                  onClick={onSelect}
                />
              ) : (
                <ListDisplayRow
                  fields={fields}
                  item={item}
                  key={item.id}
                  link={`${adminPath}/${list.path}/${item.id}`}
                  list={list}
                  onDelete={onChange}
                />
              )
          )}
        </tbody>
      </Table>
    ) : (
      <NoResults>{noResultsMessage}</NoResults>
    );
  }
}

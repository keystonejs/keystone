import React, { Component } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

import { InfoIcon, TrashcanIcon } from '@keystonejs/icons';
import { colors } from '@keystonejs/ui/src/theme';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { CheckboxPrimitive } from '@keystonejs/ui/src/primitives/forms';
import DeleteItemModal from './DeleteItemModal';

// This import is loaded by the @keystone/field-views-loader loader.
// It imports all the views required for a keystone app by looking at the adminMetaData
import FieldTypes from '../FIELD_TYPES';

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
const ItemLink = styled(Link)`
  color: ${colors.text};
  position: relative;

  /* Increase hittable area on item link */
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: -10px;
    right: -10px;
    top: -10px;
  }
`;

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
      textAlign: 'center',
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
    const { list, link, item, fields } = this.props;

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
        {fields.map((field, index) => {
          const { path } = field;

          const isLoading = !item.hasOwnProperty(path);
          if (isLoading) {
            // TODO: Better loading state?
            return <BodyCell key={path} />;
          }

          let content;

          const Cell = FieldTypes[list.key][path].Cell;

          if (Cell) {
            const LinkComponent = ({ children, ...data }) => (
              <ItemLink to={link(data)}>{children}</ItemLink>
            );
            content = (
              <Cell
                list={list}
                data={item[path]}
                field={field}
                Link={LinkComponent}
              />
            );
          } else {
            content = item[path];
          }

          return (
            <BodyCell key={path}>
              {!index ? (
                <ItemLink to={link({ path: list.path, id: item.id })}>
                  {content}
                </ItemLink>
              ) : (
                content
              )}
            </BodyCell>
          );
        })}
      </tr>
    );
  }
}

function isKeyboardEvent(e) {
  return e.clientX === 0 && e.clientY === 0;
}

class ListManageRow extends Component {
  onMouseDown = e => {
    // bail when MouseClick on the actual input, which calls onClick twice
    if (e.target.nodeName === 'INPUT' && !isKeyboardEvent(e)) return;

    // trigger onClick with the current ID
    const { isSelected, item, onSelect, onSelectStart } = this.props;
    onSelectStart(!isSelected);
    onSelect([item.id]);
  };
  onMouseUp = () => {
    // make keyboard selection easier following a mouse select
    this.checkbox.focus();
  };
  onMouseEnter = () => {
    const { isSelected, item, selectOnEnter, onSelect } = this.props;
    if (
      (selectOnEnter === 'select' && !isSelected) ||
      (selectOnEnter === 'deselect' && isSelected)
    ) {
      onSelect([item.id]);
    }
  };
  onCheckboxChange = () => {
    const { item, onSelect } = this.props;
    onSelect([item.id]);
  };
  onCheckboxMouseDown = e => {
    e.stopPropagation();
  };
  getCheckbox = ref => {
    this.checkbox = ref;
  };
  render() {
    const { fields, isSelected, item } = this.props;

    return (
      <tr
        onMouseDown={this.onMouseDown}
        onMouseEnter={this.onMouseEnter}
        onMouseUp={this.onMouseUp}
        css={{ cursor: 'default', userSelect: 'none' }}
      >
        <BodyCell isSelected={isSelected} key="checkbox">
          <CheckboxPrimitive
            checked={isSelected}
            innerRef={this.getCheckbox}
            value={item.id}
            onChange={this.onCheckboxChange}
            onMouseDown={this.onCheckboxMouseDown}
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
  state = {
    mouseOverSelectsRow: false,
  };
  handleSelectAll = () => {
    const { items, onSelectAll, selectedItems } = this.props;
    const allSelected = items.length === selectedItems.length;
    const value = allSelected ? [] : items.map(i => i.id);
    onSelectAll(value);
  };
  onSelectStart = select => {
    const { isManaging } = this.props;
    if (!isManaging) return;
    this.setState({
      mouseOverSelectsRow: select ? 'select' : 'deselect',
    });
  };
  stopRowSelectOnEnter = () => {
    const { mouseOverSelectsRow } = this.state;
    if (mouseOverSelectsRow) {
      this.setState({ mouseOverSelectsRow: false });
    }
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
    const { mouseOverSelectsRow } = this.state;

    return items.length ? (
      <Table>
        <colgroup>
          <col width="32" />
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
        <tbody
          onMouseUp={this.stopRowSelectOnEnter}
          onMouseLeave={this.stopRowSelectOnEnter}
        >
          {items.map(
            item =>
              isManaging ? (
                <ListManageRow
                  fields={fields}
                  item={item}
                  key={item.id}
                  list={list}
                  isSelected={selectedItems.includes(item.id)}
                  selectOnEnter={mouseOverSelectsRow}
                  onSelect={onSelect}
                  onSelectStart={this.onSelectStart}
                />
              ) : (
                <ListDisplayRow
                  fields={fields}
                  item={item}
                  key={item.id}
                  link={({ path, id }) => `${adminPath}/${path}/${id}`}
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

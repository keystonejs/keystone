/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { ShieldIcon, InfoIcon, TrashcanIcon, ArrowRightIcon } from '@voussoir/icons';
import { colors } from '@voussoir/ui/src/theme';
import { Button } from '@voussoir/ui/src/primitives/buttons';
import { CheckboxPrimitive } from '@voussoir/ui/src/primitives/forms';
import { A11yText } from '@voussoir/ui/src/primitives/typography';
import DeleteItemModal from './DeleteItemModal';

// This import is loaded by the @voussoir/field-views-loader loader.
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
  padding: '8px',
  textAlign: 'left',
  verticalAlign: 'bottom',
});
const BodyCell = styled('td')(({ isSelected }) => ({
  backgroundColor: isSelected ? colors.B.L90 : null,
  boxShadow: isSelected
    ? `0 1px 0 ${colors.B.L75}, 0 -1px 0 ${colors.B.L75}`
    : `0 -1px 0 ${colors.N10}`,
  padding: '8px',
  position: 'relative',
  fontSize: 15,
}));
const ItemLink = styled(Link)`
  color: ${colors.text};

  /* Increase hittable area on item link */
  &:only-of-type::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
  }
`;

const BodyCellTruncated = styled(BodyCell)`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
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

const SortDirectionArrow = styled.span(({ size = '0.2em', rotate = '0deg' }) => ({
  borderLeft: `${size} solid transparent`,
  borderRight: `${size} solid transparent`,
  borderTop: `${size} solid`,
  display: 'inline-block',
  height: 0,
  marginLeft: '0.33em',
  marginTop: '-0.125em',
  verticalAlign: 'middle',
  width: 0,
  transform: `rotate(${rotate})`,
}));

// Functional Components

type SortLinkProps = {
  handleSortChange: Function,
  active: boolean,
  sortAscending: boolean,
};

class SortLink extends React.Component<SortLinkProps> {
  onClick = () => {
    const { field, sortAscending, sortable } = this.props;
    if (sortable) {
      // Set direction to the opposite of the current sortAscending value
      this.props.handleSortChange({ field, direction: sortAscending ? 'DESC' : 'ASC' });
    }
  };

  render() {
    const styles = {
      borderBottom: `2px solid ${colors.N10}`,
      display: 'table-cell',
      fontWeight: 'normal',
      padding: '8px',
      textAlign: 'left',
      verticalAlign: 'bottom',
      color: this.props.active ? '#000' : '#999',
    };

    // TODO: Do we want to make `sortable` a field config option?
    return (
      <td style={styles} onClick={this.onClick} data-field={this.props['data-field']}>
        {this.props.field.label}
        {this.props.sortable && (
          <SortDirectionArrow
            rotate={this.props.active && !this.props.sortAscending ? '180deg' : '0deg'}
          />
        )}
      </td>
    );
  }
}

class ListDisplayRow extends Component {
  static defaultProps = {
    itemErrors: {},
  };

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
    const { item, list } = this.props;

    return (
      <DeleteItemModal
        isOpen={showDeleteModal}
        item={item}
        list={list}
        onClose={this.closeDeleteModal}
        onDelete={this.onDelete}
      />
    );
  }
  render() {
    const { list, link, item, itemErrors, fields } = this.props;

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
            <A11yText>Remove</A11yText>
          </Button>
          {this.renderDeleteModal()}
        </BodyCell>
        <BodyCell>
          <Button
            appearance="primary"
            to={link({ path: list.path, id: item.id })}
            spacing="cozy"
            variant="subtle"
            style={{ height: 24 }}
          >
            <ArrowRightIcon />
            <A11yText>Open</A11yText>
          </Button>
        </BodyCell>
        {fields.map(field => {
          const { path } = field;

          const isLoading = !item.hasOwnProperty(path);
          if (isLoading) {
            // TODO: Better loading state?
            return <BodyCell key={path} />;
          }

          if (itemErrors[path] instanceof Error && itemErrors[path].name === 'AccessDeniedError') {
            return (
              <BodyCell key={path}>
                <ShieldIcon title={itemErrors[path].message} css={{ color: colors.N10 }} />
                <A11yText>{itemErrors[path].message}</A11yText>
              </BodyCell>
            );
          }

          if (path === '_label_') {
            return (
              <BodyCellTruncated key={path}>
                <ItemLink to={link({ path: list.path, id: item.id })}>{item._label_}</ItemLink>
              </BodyCellTruncated>
            );
          }

          let content;

          const Cell = FieldTypes[list.key][path].Cell;

          if (Cell) {
            // fix this later, creating a react component on every render is really bad
            // react will rerender into the DOM on every react render
            // probably not a huge deal on a leaf component like this but still bad
            const LinkComponent = ({ children, ...data }) => (
              <ItemLink to={link(data)}>{children}</ItemLink>
            );
            content = <Cell list={list} data={item[path]} field={field} Link={LinkComponent} />;
          } else {
            content = item[path];
          }

          return <BodyCellTruncated key={path}>{content}</BodyCellTruncated>;
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
            tabIndex="0"
          />
        </BodyCell>
        <BodyCell />
        {fields.map(({ path }) => (
          <BodyCellTruncated isSelected={isSelected} key={path}>
            {item[path]}
          </BodyCellTruncated>
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
      itemsErrors = [],
      list,
      noResultsMessage,
      onChange,
      onSelect,
      handleSortChange,
      sortBy,
      selectedItems,
    } = this.props;
    const { mouseOverSelectsRow } = this.state;

    return items.length ? (
      <Table id="ks-list-table">
        <colgroup>
          <col width="32" />
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
                  tabIndex="0"
                />
              </div>
            </HeaderCell>
            <HeaderCell />
            {fields.map(field => (
              <SortLink
                data-field={field.path}
                key={field.path}
                sortable={field.path !== '_label_'}
                field={field}
                handleSortChange={handleSortChange}
                active={sortBy.field.path === field.path}
                sortAscending={sortBy.direction === 'ASC'}
              />
            ))}
          </tr>
        </thead>
        <tbody onMouseUp={this.stopRowSelectOnEnter} onMouseLeave={this.stopRowSelectOnEnter}>
          {items.map(
            (item, itemIndex) =>
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
                  itemErrors={itemsErrors[itemIndex] || {}}
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

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Component } from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { DiffIcon, InfoIcon, LinkIcon, ShieldIcon, TrashcanIcon } from '@voussoir/icons';
import { colors, gridSize } from '@arch-ui/theme';
import { CheckboxPrimitive } from '@voussoir/ui/src/primitives/forms';
import Dropdown from '@arch-ui/dropdown';
import { A11yText } from '@arch-ui/typography';
import DeleteItemModal from './DeleteItemModal';
import { copyToClipboard } from '../util';

// This import is loaded by the @voussoir/field-views-loader loader.
// It imports all the views required for a keystone app by looking at the adminMetaData
import FieldTypes from '../FIELD_TYPES';

// Styled Components
const Table = styled('table')({
  borderCollapse: 'collapse',
  borderSpacing: 0,
  marginBottom: gridSize * 4,
  width: '100%',
});
const TableRow = styled('tr')(({ isActive }) => ({
  '> td': {
    backgroundColor: isActive ? 'rgba(0, 0, 0, 0.02)' : null,
  },
}));
const HeaderCell = styled('th')({
  backgroundColor: colors.page,
  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.1)',
  boxSizing: 'border-box',
  color: '#999',
  display: 'table-cell',
  fontWeight: 'normal',
  padding: gridSize,
  position: 'sticky',
  top: 0,
  transition: 'background-color 100ms',
  zIndex: 1,
  textAlign: 'left',
  verticalAlign: 'bottom',
});
const BodyCell = styled('td')(({ isSelected }) => ({
  backgroundColor: isSelected ? colors.B.L90 : null,
  boxShadow: isSelected
    ? `0 1px 0 ${colors.B.L75}, 0 -1px 0 ${colors.B.L75}`
    : `0 -1px 0 ${colors.N10}`,
  boxSizing: 'border-box',
  padding: gridSize,
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

const SortDirectionArrow = styled.span(({ size = '0.25em', rotate = '0deg' }) => ({
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
      color: this.props.active ? '#000' : '#999',
      cursor: this.props.sortable ? 'pointer' : 'auto',
    };

    // TODO: Do we want to make `sortable` a field config option?
    return (
      <HeaderCell style={styles} onClick={this.onClick} data-field={this.props['data-field']}>
        {this.props.field.label}
        {this.props.sortable && (
          <SortDirectionArrow
            rotate={this.props.active && !this.props.sortAscending ? '180deg' : '0deg'}
          />
        )}
      </HeaderCell>
    );
  }
}

// ==============================
// Common for display & manage
// ==============================

class ListRow extends Component {
  static defaultProps = { itemErrors: {} };
  state = { showDeleteModal: false };
  componentDidMount() {
    this.mounted = true;
  }
  componentWillUnmount() {
    this.mounted = false;
  }

  onCheckboxChange = () => {
    const { item, onSelect } = this.props;
    onSelect(item.id);
  };

  // ==============================
  // Display
  // ==============================

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
    const { list, link, isSelected, item, itemErrors, fields } = this.props;

    const row = (
      <TableRow>
        <BodyCell isSelected={isSelected} key="checkbox">
          <CheckboxPrimitive
            checked={isSelected}
            innerRef={this.getCheckbox}
            value={item.id}
            onChange={this.onCheckboxChange}
            tabIndex="0"
          />
          {this.renderDeleteModal()}
        </BodyCell>
        {fields.map(field => {
          const { path } = field;

          const isLoading = !item.hasOwnProperty(path);

          if (isLoading) {
            return <BodyCell key={path} />; // TODO: Better loading state?
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
              <BodyCellTruncated isSelected={isSelected} key={path}>
                <ItemLink to={link({ path: list.path, id: item.id })}>{item._label_}</ItemLink>
              </BodyCellTruncated>
            );
          }

          let content;

          const Cell = FieldTypes[list.key][path].Cell;

          if (Cell) {
            // TODO
            // fix this later, creating a react component on every render is really bad
            // react will rerender into the DOM on every react render
            // probably not a huge deal on a leaf component like this but still bad
            const LinkComponent = ({ children, ...data }) => (
              <ItemLink to={link(data)}>{children}</ItemLink>
            );
            content = (
              <Cell
                isSelected={isSelected}
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
            <BodyCellTruncated isSelected={isSelected} key={path}>
              {content}
            </BodyCellTruncated>
          );
        })}
      </TableRow>
    );
    const copyText = window.location.origin + link({ path: list.path, id: item.id });
    const items = [
      {
        content: 'Duplicate',
        icon: <DiffIcon />,
        isDisabled: true, // TODO: implement duplicate
        onClick: () => console.log('TODO'),
      },
      {
        content: 'Copy Link',
        icon: <LinkIcon />,
        onClick: () => copyToClipboard(copyText),
      },
      {
        content: 'Delete',
        icon: <TrashcanIcon />,
        onClick: this.showDeleteModal,
      },
    ];

    return <Dropdown mode="contextmenu" target={row} items={items} />;
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
      isFullWidth,
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

    return items.length ? (
      <Table id="ks-list-table" style={{ tableLayout: isFullWidth ? null : 'fixed' }}>
        <colgroup>
          <col width="32" />
        </colgroup>
        <thead>
          <tr>
            <HeaderCell>
              <div css={{ position: 'relative', top: 3 }}>
                <CheckboxPrimitive
                  checked={items.length === selectedItems.length}
                  onChange={this.handleSelectAll}
                  tabIndex="0"
                />
              </div>
            </HeaderCell>
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
        <tbody>
          {items.map((item, itemIndex) => (
            <ListRow
              fields={fields}
              isSelected={selectedItems.includes(item.id)}
              item={item}
              itemErrors={itemsErrors[itemIndex] || {}}
              key={item.id}
              link={({ path, id }) => `${adminPath}/${path}/${id}`}
              list={list}
              onDelete={onChange}
              onSelect={onSelect}
            />
          ))}
        </tbody>
      </Table>
    ) : (
      <NoResults>{noResultsMessage}</NoResults>
    );
  }
}

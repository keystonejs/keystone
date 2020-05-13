/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Component, Suspense, Fragment } from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

import { captureSuspensePromises, noop } from '@keystonejs/utils';
import { KebabHorizontalIcon, LinkIcon, ShieldIcon, TrashcanIcon } from '@arch-ui/icons';
import { colors, gridSize } from '@arch-ui/theme';
import { alpha } from '@arch-ui/color-utils';
import { Button } from '@arch-ui/button';
import { CheckboxPrimitive } from '@arch-ui/controls';
import Dropdown from '@arch-ui/dropdown';
import { A11yText } from '@arch-ui/typography';
import { Card } from '@arch-ui/card';
import DeleteItemModal from './DeleteItemModal';
import copyToClipboard from 'clipboard-copy';
import { useListSort } from '../pages/List/dataHooks';
import PageLoading from './PageLoading';
import { NoResults } from './NoResults';

const Render = ({ children }) => children();

// Styled Components
const Table = styled('table')({
  borderCollapse: 'collapse',
  borderSpacing: 0,
  width: '100%',
});
const TableRow = styled('tr')(({ isActive }) => ({
  '> td': {
    backgroundColor: isActive ? 'rgba(0, 0, 0, 0.02)' : null,
  },
}));
const HeaderCell = styled('th')(({ isSelected, isSortable }) => ({
  backgroundColor: 'white',
  boxShadow: `0 2px 0 ${alpha(colors.text, 0.1)}`,
  boxSizing: 'border-box',
  color: isSelected ? colors.text : colors.N40,
  cursor: isSortable ? 'pointer' : 'auto',
  display: 'table-cell',
  fontWeight: 'normal',
  padding: gridSize,
  position: 'sticky',
  top: 0,
  transition: 'background-color 100ms',
  zIndex: 1,
  textAlign: 'left',
  verticalAlign: 'bottom',
  fontSize: '1.1rem',

  ':hover': {
    color: isSortable && !isSelected ? colors.N60 : null,
  },
}));
const BodyCell = styled('td')(({ isSelected }) => ({
  backgroundColor: isSelected ? colors.B.L95 : null,
  boxShadow: isSelected
    ? `0 1px 0 ${colors.B.L85}, 0 -1px 0 ${colors.B.L85}`
    : `0 -1px 0 ${colors.N10}`,
  boxSizing: 'border-box',
  padding: `${gridSize + 2}px ${gridSize}px`,
  position: 'relative',
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
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
`;

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
    // TODO: Do we want to make `sortable` a field config option?
    return (
      <HeaderCell
        isSortable={this.props.sortable}
        isSelected={this.props.active}
        onClick={this.onClick}
        data-field={this.props['data-field']}
      >
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
  static defaultProps = { itemErrors: {}, linkField: '_label_' };
  state = { showDeleteModal: false };
  componentDidMount() {
    this.mounted = true;
  }
  componentWillUnmount() {
    this.mounted = false;
  }

  onCheckboxChange = () => {
    const { item, onSelectChange } = this.props;
    onSelectChange(item.id);
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
    const { list, link, isSelected, item, itemErrors, fields, linkField } = this.props;
    const copyText = window.location.origin + link({ path: list.path, item });
    const items = [
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

    return (
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

          if (itemErrors[path] instanceof Error && itemErrors[path].name === 'AccessDeniedError') {
            return (
              <BodyCell key={path}>
                <ShieldIcon title={itemErrors[path].message} css={{ color: colors.N20 }} />
                <A11yText>{itemErrors[path].message}</A11yText>
              </BodyCell>
            );
          }

          if (path === linkField) {
            return (
              <BodyCellTruncated isSelected={isSelected} key={path}>
                <ItemLink to={link({ path: list.path, item })}>{item[linkField]}</ItemLink>
              </BodyCellTruncated>
            );
          }

          let content;

          if (field.views.Cell) {
            const [Cell] = field.readViews([field.views.Cell]);

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
        <BodyCell isSelected={isSelected} css={{ padding: 0 }}>
          <Dropdown
            align="right"
            target={handlers => (
              <Button
                variant="subtle"
                css={{
                  opacity: 0,
                  transition: 'opacity 150ms',
                  'tr:hover > td > &': { opacity: 1 },
                }}
                {...handlers}
              >
                <KebabHorizontalIcon />
              </Button>
            )}
            items={items}
          />
        </BodyCell>
      </TableRow>
    );
  }
}

const SingleCell = ({ columns, children }) => (
  <tr>
    <td colSpan={columns}>{children}</td>
  </tr>
);

export default function ListTable({
  adminPath,
  columnControl,
  fields,
  isFullWidth,
  items,
  queryErrors = [],
  list,
  onChange,
  onSelectChange,
  selectedItems,
  currentPage,
  filters,
  search,
  itemLink = ({ path, item }) => `${adminPath}/${path}/${item.id}`,
  linkField = '_label_',
}) {
  const [sortBy, onSortChange] = useListSort();

  const handleSelectAll = () => {
    const allSelected = items && items.length === selectedItems.length;
    const value = allSelected ? [] : items.map(i => i.id);
    onSelectChange(value);
  };

  const cypressId = 'ks-list-table';

  // +2 because of check-boxes on left, and overflow menu on right
  const columns = fields.length + 2;

  const TableContents = ({ isLoading, children }) => (
    <Fragment>
      <colgroup>
        <col width="32" />
        {fields.map(f => (
          <col key={f.path} />
        ))}
        <col width="32" />
      </colgroup>
      <thead>
        <tr>
          <HeaderCell>
            <div css={{ position: 'relative', top: 3 }}>
              <CheckboxPrimitive
                checked={items && items.length && items.length === selectedItems.length}
                onChange={isLoading ? noop : handleSelectAll}
                tabIndex="0"
                isDisabled={isLoading}
              />
            </div>
          </HeaderCell>
          {fields.map(field => {
            if (!sortBy) return;
            return (
              <SortLink
                data-field={field.path}
                key={field.path}
                sortable={field.path !== '_label_' && field.isOrderable}
                field={field}
                handleSortChange={onSortChange}
                active={sortBy ? sortBy.field.path === field.path : false}
                sortAscending={sortBy ? sortBy.direction === 'ASC' : 'ASC'}
              />
            );
          })}
          <HeaderCell css={{ padding: 0 }}>{columnControl}</HeaderCell>
        </tr>
      </thead>
      <tbody data-test-table-loaded={!isLoading}>{children}</tbody>
    </Fragment>
  );

  return (
    <Card css={{ marginBottom: '3em' }}>
      <Table id={cypressId} style={{ tableLayout: isFullWidth ? null : 'fixed' }}>
        <Suspense
          fallback={
            <TableContents isLoading>
              <SingleCell columns={columns}>
                <PageLoading />
              </SingleCell>
            </TableContents>
          }
        >
          <Render>
            {() => {
              // Now that the network request for data has been triggered, we
              // try to initialise the fields. They are Suspense capable, so may
              // throw Promises which will be caught by the above <Suspense>
              captureSuspensePromises(
                fields
                  .filter(field => field.path !== '_label_')
                  .map(field => () => field.initCellView())
              );

              // NOTE: We don't check for isLoading here because we want to
              // avoid showing the <PageLoading /> component when we already
              // have (possibly stale) data to show.
              // Instead, we show the loader when there's _no data at all_.
              if (!items) {
                return (
                  <TableContents isLoading>
                    <SingleCell columns={columns}>
                      <PageLoading />
                    </SingleCell>
                  </TableContents>
                );
              }

              if (!items.length) {
                return (
                  <TableContents>
                    <SingleCell columns={columns}>
                      <NoResults
                        currentPage={currentPage}
                        filters={filters}
                        list={list}
                        search={search}
                      />
                    </SingleCell>
                  </TableContents>
                );
              }

              return (
                <TableContents>
                  {items
                    .map(item => list.deserializeItemData(item))
                    .map((item, itemIndex) => (
                      <ListRow
                        fields={fields}
                        isSelected={selectedItems.includes(item.id)}
                        item={item}
                        itemErrors={queryErrors[itemIndex] || {}}
                        key={item.id}
                        link={itemLink}
                        linkField={linkField}
                        list={list}
                        onDelete={onChange}
                        onSelectChange={onSelectChange}
                      />
                    ))}
                </TableContents>
              );
            }}
          </Render>
        </Suspense>
      </Table>
    </Card>
  );
}

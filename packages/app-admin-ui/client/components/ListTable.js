/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Suspense, Fragment, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { captureSuspensePromises, noop } from '@keystonejs/utils';
import { KebabHorizontalIcon, LinkIcon, ShieldIcon, TrashcanIcon } from '@primer/octicons-react';
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
import { ErrorBoundary } from './ErrorBoundary';

const Render = ({ children }) => children();

// Styled Components
const Table = props => (
  <table
    css={{
      borderCollapse: 'collapse',
      borderSpacing: 0,
      tableLayout: 'fixed',
      width: '100%',
    }}
    {...props}
  />
);

const TableRow = ({ isSelected, ...props }) => (
  <tr
    css={{
      '> td': {
        backgroundColor: isSelected ? colors.B.L95 : null,
        boxShadow: isSelected
          ? `0 1px 0 ${colors.B.L85}, 0 -1px 0 ${colors.B.L85}`
          : `0 -1px 0 ${colors.N10}`,
      },
    }}
    {...props}
  />
);

const HeaderCell = ({ isSelected, isSortable, ...props }) => (
  <th
    css={{
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
    }}
    {...props}
  />
);

const BodyCell = props => (
  <td
    css={{
      boxSizing: 'border-box',
      padding: `${gridSize + 2}px ${gridSize}px`,
      position: 'relative',
    }}
    {...props}
  />
);

const ItemLink = ({ path, item, ...props }) => (
  <Link
    to={`${path}/${item.id}`}
    css={{
      color: colors.text,

      /* Increase hittable area on item link */
      '&:only-of-type::before': {
        content: '" "',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
      },
    }}
    {...props}
  />
);

const BodyCellTruncated = props => (
  <BodyCell
    css={{
      maxWidth: '10rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      wordWrap: 'normal',
    }}
    {...props}
  />
);

const SortDirectionArrow = ({ size = '0.25em', rotate = '0deg', ...props }) => (
  <span
    css={{
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
    }}
    {...props}
  />
);

// Functional Components

const SortLink = ({
  field,
  'data-field': dataField,
  active,
  sortAscending,
  sortable,
  handleSortChange,
}) => {
  const onClick = () => {
    if (sortable) {
      // Set direction to the opposite of the current sortAscending value
      handleSortChange({ field, direction: sortAscending ? 'DESC' : 'ASC' });
    }
  };

  return (
    <HeaderCell isSortable={sortable} isSelected={active} onClick={onClick} data-field={dataField}>
      {field.label}
      {sortable && <SortDirectionArrow rotate={active && sortAscending ? '180deg' : '0deg'} />}
    </HeaderCell>
  );
};

// ==============================
// Common for display & manage
// ==============================

const ListRow = ({
  list,
  fields,
  item,
  itemErrors = {},
  linkField = '_label_',
  isSelected,
  onSelectChange,
  onDelete,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onCheckboxChange = () => {
    onSelectChange(item.id);
  };

  // ==============================
  // Display
  // ==============================

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDelete = result => {
    if (onDelete) onDelete(result);
    if (!mounted.current) return;
    setShowDeleteModal(false);
  };

  const items = [
    {
      content: 'Copy Link',
      icon: <LinkIcon />,
      onClick: () => copyToClipboard(`${window.location.origin}${list.fullPath}/${item.id}`),
    },
    {
      content: 'Delete',
      icon: <TrashcanIcon />,
      onClick: openDeleteModal,
    },
  ];

  return (
    <TableRow isSelected={isSelected}>
      <BodyCell key="checkbox">
        <CheckboxPrimitive
          checked={isSelected}
          value={item.id}
          onChange={onCheckboxChange}
          tabIndex="0"
        />
        <DeleteItemModal
          isOpen={showDeleteModal}
          item={item}
          list={list}
          onClose={closeDeleteModal}
          onDelete={handleDelete}
        />
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
            <BodyCellTruncated key={path}>
              <ItemLink path={list.fullPath} item={item}>
                {item[linkField]}
              </ItemLink>
            </BodyCellTruncated>
          );
        }

        let content;

        if (field.views.Cell) {
          const [Cell] = field.readViews([field.views.Cell]);

          content = (
            <ErrorBoundary>
              <Cell
                isSelected={isSelected}
                list={list}
                item={item} // FIXME: just passing this for the password cell, but not that optimal
                data={item[path]}
                field={field}
                Link={ItemLink}
              />
            </ErrorBoundary>
          );
        } else {
          content = item[path];
        }

        return (
          <BodyCellTruncated
            key={path}
            css={{ fontFamily: field.isPrimaryKey ? 'Monaco, Consolas, monospace' : null }}
          >
            {content}
          </BodyCellTruncated>
        );
      })}
      <BodyCell css={{ padding: 0 }}>
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
};

const SingleCell = ({ columns, children }) => (
  <tr>
    <td colSpan={columns}>{children}</td>
  </tr>
);

export default function ListTable({
  columnControl,
  fields,
  items,
  queryErrors = [],
  list,
  onDelete,
  onSelectChange,
  selectedItems,
  currentPage,
  filters,
  search,
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
        <col css={{ width: '40px' }} />
        {fields.map(f => (
          <col key={f.path} />
        ))}
        <col css={{ width: '40px' }} />
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
      <Table id={cypressId}>
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
                        linkField={linkField}
                        list={list}
                        onDelete={onDelete}
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

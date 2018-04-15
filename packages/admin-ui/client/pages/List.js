import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import Select from 'react-select';
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Input } from '@keystonejs/ui/src/primitives/forms';
import { Page } from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';

const getListQueryArguments = ({ search, sort }) => {
  const args = [];
  if (search) {
    args.push(`search: "${search}"`);
  }
  if (sort) {
    args.push(`sort: "${sort}"`);
  }
  return args.length ? `(${args.join(' ')})` : '';
};

const getListQuery = ({ fields, list, search, sort }) => {
  const args = getListQueryArguments({ search, sort });
  console.log(args);

  return gql`
{
  ${list.listQueryName}${args} {
    ${['id', ...fields.map(({ path }) => path)].join('\n')}
  }
}
  `;
};

const Table = styled('table')`
  border-collapse: collapse;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
`;

const HeaderCell = styled('td')`
  border-bottom: 2px solid rgba(0, 0, 0, 0.06);
  color: #999;
  padding-bottom: 8px;
  display: table-cell;
  font-weight: normal;
  text-align: left;
  vertical-align: bottom;
`;

const BodyCell = styled('td')`
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 8px 0;
`;

const getSelectedButtonStyles = ({ isSelected }) =>
  isSelected
    ? `
  background-color: #333;
  color: #fff;
`
    : `
  background-color: #fff;
  color: #333;
`;
const Button = styled('button')`
  border: 1px solid #333;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  font-size: 12px;
  outline: none;
  padding: 4px 8px;

  ${getSelectedButtonStyles};

  &:active {
    background-color: #111;
    border-color: #111;
    color: #fff;
  }
`;

class ItemRow extends Component {
  render() {
    const { list, item, fields } = this.props;

    return (
      <tr>
        {fields.map(({ path }, index) => (
          <BodyCell key={path}>
            {!index ? (
              <Link to={`/admin/${list.path}/${item.id}`}>{item[path]}</Link>
            ) : (
              item[path]
            )}
          </BodyCell>
        ))}
      </tr>
    );
  }
}

class ItemsList extends Component {
  render() {
    const { items, fields, list, search } = this.props;
    return items.length ? (
      <Table>
        <thead>
          <tr>
            {fields.map(({ label }) => (
              <HeaderCell key={label}>{label}</HeaderCell>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <ItemRow key={item.id} list={list} fields={fields} item={item} />
          ))}
        </tbody>
      </Table>
    ) : (
      `No ${list.plural.toLowerCase()} found matching ${search}.`
    );
  }
}

const FieldsSelectorWrapper = styled('div')`
  align-items: center;
  display: flex;
  margin: 12px 0;
`;
const FieldsSelectorChild = styled('div')`
  margin-right: 4px;
`;
class FieldsSelector extends Component {
  handleClick = field => {
    const { activeFields, fields, onChange } = this.props;

    const newActiveFields = fields.filter(potentiallyActiveField => {
      const isClickedField = field === potentiallyActiveField;
      const isAlreadyActive = activeFields.indexOf(potentiallyActiveField) >= 0;
      return isClickedField ? !isAlreadyActive : isAlreadyActive;
    });
    onChange(newActiveFields);
  };

  render() {
    const { activeFields, fields } = this.props;

    return (
      <FieldsSelectorWrapper>
        <FieldsSelectorChild key="label">Display: </FieldsSelectorChild>
        {fields.map(field => {
          const { label, path } = field;
          const isActive = activeFields.indexOf(field) >= 0;

          return (
            <FieldsSelectorChild key={path}>
              <Button
                isSelected={isActive}
                onClick={() => this.handleClick(field)}
              >
                {label}
              </Button>
            </FieldsSelectorChild>
          );
        })}
      </FieldsSelectorWrapper>
    );
  }
}

class ListItemSorter extends Component {
  static orderOptions = [
    { label: 'Ascending', value: 'ASC' },
    { label: 'Descending', value: 'DESC' },
  ];

  handleChange = ({ order: orderOption, orderBy: orderByOption }) => {
    const { fields, onChange } = this.props;
    const order = orderOption.value;
    const orderBy = fields.find(({ path }) => path === orderByOption.value);
    onChange({ order, orderBy });
  };

  render() {
    const { fields, orderBy: orderByOption, order: orderKey } = this.props;
    const order = ListItemSorter.orderOptions.find(
      ({ value }) => value === orderKey
    );

    const orderByOptions = fields.map(({ label, path }) => ({
      label,
      value: path,
    }));
    const orderBy = orderByOptions.find(
      ({ value }) => value === orderByOption.path
    );

    return (
      <FieldsSelectorWrapper>
        <FieldsSelectorChild>
          <strong>Sort:</strong>
        </FieldsSelectorChild>
        <FieldsSelectorChild>
          <Select
            onChange={newOrderBy =>
              this.handleChange({ orderBy: newOrderBy, order })
            }
            options={orderByOptions}
            selectedOption={orderBy}
            styles={{
              control: provided => ({ ...provided, width: '250px' }),
            }}
            value={orderBy}
          />
        </FieldsSelectorChild>
        <FieldsSelectorChild>
          <Select
            onChange={newOrder =>
              this.handleChange({ orderBy, order: newOrder })
            }
            options={ListItemSorter.orderOptions}
            selectedOption={order}
            styles={{
              control: provided => ({ ...provided, width: '150px' }),
            }}
            value={order}
          />
        </FieldsSelectorChild>
      </FieldsSelectorWrapper>
    );
  }
}

class ListPage extends Component {
  constructor(props) {
    super(props);
    const displayedFields = this.props.list.fields.slice(0, 2);
    const orderBy = displayedFields[0];
    this.state = { displayedFields, order: 'ASC', orderBy, search: '' };
  }

  // We record the number of items returned by the latest query so that the
  // previous count can be displayed during a loading state.
  itemsCount: 0;

  handleSearch = e => {
    const { value: search } = e.target;
    this.setState({ search });
  };

  handleFieldSelect = displayedFields => {
    this.setState({ displayedFields });
  };

  handleSortChange = ({ order, orderBy }) => {
    this.setState({ order, orderBy });
  };

  render() {
    const { list } = this.props;
    const { displayedFields, order, orderBy, search } = this.state;

    const sort = `${order === 'DESC' ? '-' : ''}${orderBy.path}`;

    const query = getListQuery({
      fields: displayedFields,
      list,
      search,
      sort,
    });

    console.log(query);

    return (
      <Fragment>
        <Nav />
        <Page>
          <Query query={query}>
            {({ data, error }) => {
              if (error) {
                return (
                  <Fragment>
                    <Title>Error</Title>
                    <p>{error.message}</p>
                  </Fragment>
                );
              }

              const items = data && data[list.listQueryName];
              this.count =
                items && typeof items.length === 'number'
                  ? items.length
                  : this.count;

              return (
                <Fragment>
                  <Title>
                    {this.count}{' '}
                    {this.count === 1
                      ? list.label.toLowerCase()
                      : list.plural.toLowerCase()}
                  </Title>
                  <Input
                    onChange={this.handleSearch}
                    placeholder="Search"
                    value={search}
                  />
                  <FieldsSelector
                    activeFields={displayedFields}
                    fields={list.fields}
                    onChange={this.handleFieldSelect}
                  />
                  <ListItemSorter
                    fields={displayedFields}
                    onChange={this.handleSortChange}
                    order={order}
                    orderBy={orderBy}
                  />
                  {items ? (
                    <ItemsList
                      items={items}
                      list={list}
                      fields={displayedFields}
                      search={search}
                    />
                  ) : (
                    <Title>Loading...</Title>
                  )}
                </Fragment>
              );
            }}
          </Query>
        </Page>
      </Fragment>
    );
  }
}

export default ListPage;

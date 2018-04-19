import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import Select, { components } from 'react-select';
import { Query } from 'react-apollo';

import Nav from '../components/Nav';
import { Input } from '@keystonejs/ui/src/primitives/forms';
import { Container, FluidGroup } from '@keystonejs/ui/src/primitives/layout';
import { BodyCell } from '@keystonejs/ui/src/primitives/tables';
import { Title } from '@keystonejs/ui/src/primitives/typography';

import ListTable from '../components/ListTable';

const getQueryArgs = args => {
  const queryArgs = Object.keys(args).map(
    argName => `${argName}: "${args[argName]}"`
  );
  return queryArgs.length ? `(${queryArgs.join(' ')})` : '';
};

const getQuery = ({ fields, list, search, sort }) => {
  const queryArgs = getQueryArgs({ search, sort });
  const queryFields = ['id', ...fields.map(({ path }) => path)];

  return gql`{
  ${list.listQueryName}${queryArgs} {
    ${queryFields.join('\n')}
  }
}`;
};

/**
 * Handy little bridge that converts a list's fields into the format that
 * react-select expects, then converts them back before calling onChange. This
 * is necessary because fields can contain an 'options' property which causes
 * react-select to interpret it as an option-group.
 */
class FieldsSelect extends Component {
  handleChange = selected => {
    const { fields, isMulti, onChange } = this.props;
    const selectedFields = isMulti
      ? selected.map(({ value }) => fields.find(({ path }) => path === value))
      : fields.find(({ path }) => path === selected.value);
    onChange(selectedFields);
  };

  render() {
    const { fields, onChange, value, ...props } = this.props;

    // Convert the fields data into the format react-select expects.
    const options = fields.map(({ label, path }) => ({ label, value: path }));

    // Pick out the selected option(s). This is slightly different if it's a
    // multi-select. We need to filter it/them out of `options` rather than
    // transforming `value` here because react-select appears to determine which
    // option to focus by doing some kind of reference equality check.
    const selected = (() => {
      if (props.isMulti) {
        const selectedFieldPaths = value.map(({ path }) => path);
        return options.filter(option =>
          selectedFieldPaths.includes(option.value)
        );
      }
      return options.find(option => option.value === value.path);
    })();

    return (
      <Select
        onChange={this.handleChange}
        options={options}
        value={selected}
        {...props}
      />
    );
  }
}

const Label = styled('label')({
  color: '#999',
  display: 'block',
  fontSize: '12px',
  marginBottom: '4px',
});

class ListPage extends Component {
  constructor(props) {
    super(props);
    const displayedFields = this.props.list.fields.slice(0, 2);
    const order = ListPage.orderOptions[0];
    const orderBy = displayedFields[0];
    this.state = { displayedFields, order, orderBy, search: '' };
  }

  static orderOptions = [
    { label: 'Ascending', value: 'ASC' },
    { label: 'Descending', value: 'DESC' },
  ];

  // We record the number of items returned by the latest query so that the
  // previous count can be displayed during a loading state.
  itemsCount: 0;

  handleSearch = e => {
    const { value: search } = e.target;
    this.setState({ search });
  };

  handleSelectedFieldsChange = selectedFields => {
    // Don't remove the last field.
    if (!selectedFields.length) {
      return;
    }

    // Ensure that the displayed fields maintain their original order when
    // they're added/removed.
    const displayedFields = this.props.list.fields.filter(field =>
      selectedFields.includes(field)
    );

    // Reset orderBy if we were ordering by a field which has been removed.
    const orderBy = displayedFields.includes(this.state.orderBy)
      ? this.state.orderBy
      : displayedFields[0];

    this.setState({ displayedFields, orderBy });
  };

  handleOrderByChange = orderBy => this.setState({ orderBy });

  handleOrderChange = order => this.setState({ order });

  render() {
    const { list } = this.props;
    const { displayedFields, order, orderBy, search } = this.state;

    const sort = `${order.value === 'DESC' ? '-' : ''}${orderBy.path}`;

    const query = getQuery({
      fields: displayedFields,
      list,
      search,
      sort,
    });

    const selectStyles = {
      control: provided => ({ ...provided, minWidth: '200px' }),
    };

    return (
      <Fragment>
        <Nav />
        <Container>
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
                  <div css={{ margin: '12px 0' }}>
                    <FluidGroup>
                      <div>
                        <Label>Display:</Label>
                        <FieldsSelect
                          components={{
                            MultiValueRemove:
                              displayedFields.length > 1
                                ? components.MultiValueRemove
                                : () => null,
                          }}
                          fields={list.fields}
                          isClearable={false}
                          isMulti
                          onChange={this.handleSelectedFieldsChange}
                          styles={{
                            ...selectStyles,
                            multiValueLabel:
                              displayedFields.length === 1
                                ? provided => ({
                                    ...provided,
                                    paddingRight: '6px',
                                  })
                                : null,
                          }}
                          value={displayedFields}
                        />
                      </div>
                      <div>
                        <Label>Order by:</Label>
                        <FieldsSelect
                          fields={displayedFields}
                          onChange={this.handleOrderByChange}
                          styles={selectStyles}
                          value={orderBy}
                        />
                      </div>
                      <div>
                        <Label>Order:</Label>
                        <Select
                          options={ListPage.orderOptions}
                          onChange={this.handleOrderChange}
                          styles={selectStyles}
                          value={order}
                        />
                      </div>
                    </FluidGroup>
                  </div>
                  {items ? (
                    <ListTable
                      cellComponent={({ children, index, item }) =>
                        !index ? (
                          <BodyCell>
                            <Link to={`/admin/${list.path}/${item.id}`}>
                              {children}
                            </Link>
                          </BodyCell>
                        ) : (
                          <BodyCell>{children}</BodyCell>
                        )
                      }
                      fields={displayedFields}
                      items={items}
                      noResultsMessage={`No ${list.plural.toLowerCase()} found matching ${search}.`}
                    />
                  ) : (
                    <Title>Loading...</Title>
                  )}
                </Fragment>
              );
            }}
          </Query>
        </Container>
      </Fragment>
    );
  }
}

export default ListPage;

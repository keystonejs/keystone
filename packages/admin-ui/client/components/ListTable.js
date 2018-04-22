import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import {
  BodyCell,
  HeaderCell,
  Table,
} from '@keystonejs/ui/src/primitives/tables';

class ListTableRow extends Component {
  render() {
    const { link, item, fields } = this.props;

    return (
      <tr>
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
    const { items, fields, list, noResultsMessage, adminPath } = this.props;

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
            <ListTableRow
              key={item.id}
              link={`${adminPath}/${list.path}/${item.id}`}
              fields={fields}
              item={item}
            />
          ))}
        </tbody>
      </Table>
    ) : (
      noResultsMessage
    );
  }
}

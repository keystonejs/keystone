import React, { Component } from 'react';

import {
  BodyCell,
  HeaderCell,
  Table,
} from '@keystonejs/ui/src/primitives/tables';

class ListTableRow extends Component {
  static defaultProps = {
    cellComponent: BodyCell,
  };

  render() {
    const { cellComponent: Cell, item, fields } = this.props;

    return (
      <tr>
        {fields.map((field, index) => (
          <Cell
            field={field}
            fields={fields}
            index={index}
            item={item}
            key={field.path}
          >
            {item[field.path]}
          </Cell>
        ))}
      </tr>
    );
  }
}

export default class ListTable extends Component {
  render() {
    const { cellComponent, fields, items, noResultsMessage } = this.props;
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
              cellComponent={cellComponent}
              fields={fields}
              item={item}
              key={item.id}
            />
          ))}
        </tbody>
      </Table>
    ) : (
      noResultsMessage
    );
  }
}

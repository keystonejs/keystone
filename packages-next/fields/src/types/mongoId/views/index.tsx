/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { TextInput } from '@keystone-ui/fields';
import { FieldController, FieldControllerConfig } from '@keystone-next/types';

export { Field, Cell } from '../../text/views';

type CheckboxController = FieldController<string, string>;

export const controller = (config: FieldControllerConfig): CheckboxController => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize(item) {
      const value = item[config.path];
      return typeof value === 'string' ? value : '';
    },
    serialize(value) {
      return {
        [config.path]: value,
      };
    },
    filter: {
      Filter(props) {
        return (
          <TextInput
            onChange={event => {
              props.onChange(event.target.value);
            }}
            value={props.value}
            autoFocus
          />
        );
      },
      graphql({ type, value }) {
        switch (type) {
          case 'is': {
            return { [config.path]: value };
          }
          case 'not': {
            return { [`${config.path}_not`]: value };
          }
          case 'in': {
            return { [`${config.path}_in`]: value.split(',').map(value => value.trim()) };
          }
          case 'not_in': {
            return { [`${config.path}_not_in`]: value.split(',').map(value => value.trim()) };
          }
        }
        return {};
      },
      Label({ label, type, value }) {
        let renderedValue = value;
        if (['in', 'not_in'].includes(type)) {
          renderedValue = value
            .split(',')
            .map(value => value.trim())
            .join(', ');
        }
        return `${label.toLowerCase()}: ${renderedValue}`;
      },
      types: {
        is: {
          label: 'Is exactly',
          initialValue: '',
        },
        not: {
          label: 'Is not',
          initialValue: '',
        },
        in: {
          label: 'Is one of',
          initialValue: '',
        },
        not_in: {
          label: 'Is not one of',
          initialValue: '',
        },
      },
    },
  };
};

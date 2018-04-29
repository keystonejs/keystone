import React, { Component, Fragment } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { Button } from '@keystonejs/ui/src/primitives/buttons';
import { Dialog } from '@keystonejs/ui/src/primitives/modals';
import styled from 'react-emotion';
import FieldViews from '../pages/KEYSTONE_FIELD_VIEWS';

const getCreateMutation = ({ list }) => {
  return gql`
    mutation create($data: ${list.key}UpdateInput!) {
      ${list.createMutationName}(data: $data) {
        id
      }
    }
  `;
};

const Form = styled.div({
  margin: '24px 0',
});

export default class CreateItemModal extends Component {
  constructor(props) {
    super(props);
    let { list } = props;
    let item = list.fields.reduce((acc, i) => {
      acc[i.path] = '';
      return acc;
    }, {});
    this.state = { item };
  }

  onClose = () => {
    if (this.isLoading) return;
    this.props.onClose();
  };
  onKeyDown = e => {
    if (e.key === 'Escape') {
      this.props.onClose();
    }
  };
  onChange = (field, value) => {
    const { item } = this.state;
    this.setState({
      item: {
        ...item,
        [field.path]: value,
      },
    });
  };
  render() {
    const { list } = this.props;
    const { item } = this.state;
    const createMutation = getCreateMutation({ list });
    return (
      <Mutation mutation={createMutation}>
        {(createItem, { loading }) => {
          this.isLoading = loading;
          return (
            <Dialog
              isOpen
              onClose={this.onClose}
              heading={`Create ${list.singular}`}
              onKeyDown={this.onKeyDown}
              footer={
                <Fragment>
                  <Button
                    appearance="create"
                    onClick={() => {
                      if (loading) return;
                      createItem({
                        variables: { data: item },
                      }).then(this.props.onCreate);
                    }}
                  >
                    {loading ? 'Loading...' : `Create ${list.singular}`}
                  </Button>
                  <Button
                    appearance="primary"
                    variant="subtle"
                    onClick={this.onClose}
                  >
                    Cancel
                  </Button>
                </Fragment>
              }
            >
              <Form>
                {list.fields.map(field => {
                  const { Field } = FieldViews[list.key][field.path];
                  return (
                    <Field
                      item={item}
                      field={field}
                      key={field.path}
                      onChange={this.onChange}
                    />
                  );
                })}
              </Form>
            </Dialog>
          );
        }}
      </Mutation>
    );
  }
}

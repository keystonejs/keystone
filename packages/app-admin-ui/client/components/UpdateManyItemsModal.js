/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment, useState, useMemo, useCallback, Suspense } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Button, LoadingButton } from '@arch-ui/button';
import Drawer from '@arch-ui/drawer';
import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import Select from '@arch-ui/select';
import { omit, arrayToObject, countArrays } from '@keystonejs/utils';
import { LoadingIndicator } from '@arch-ui/loading';

import { validateFields } from '../util';
import CreateItemModal from './CreateItemModal';

let Render = ({ children }) => children();

const UpdateManyModal = ({
  list,
  items,
  isLoading,
  isOpen,
  updateItem,
  onUpdate: onUpdateCallback,
  onClose: onCloseCallback,
}) => {
  const [item, setItem] = useState(list.getInitialItemData());
  const [selectedFields, setSelectedFields] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [validationWarnings, setValidationWarnings] = useState({});

  const onUpdate = async () => {
    if (isLoading || countArrays(validationErrors)) {
      return;
    }

    const data = arrayToObject(selectedFields, 'path', field => field.serialize(item));

    if (!countArrays(validationWarnings)) {
      const { errors, warnings } = await validateFields(selectedFields, item, data);

      if (countArrays(errors) + countArrays(warnings) > 0) {
        setValidationErrors(errors);
        setValidationWarnings(warnings);

        return;
      }
    }

    updateItem({
      variables: {
        data: items.map(id => ({ id, data })),
      },
    }).then(() => {
      onUpdateCallback();
      resetState();
    });
  };

  const resetState = () => {
    setItem(list.getInitialItemData({}));
    setSelectedFields([]);
  };

  const onClose = () => {
    if (!isLoading) {
      resetState();
      onCloseCallback();
    }
  };

  const onKeyDown = event => {
    if (event.defaultPrevented) return;
    switch (event.key) {
      case 'Escape':
        return onClose();
      case 'Enter':
        return onUpdate();
    }
  };

  const handleSelect = selected => {
    setSelectedFields(
      selected.map(({ path, value }) => {
        return list.fields
          .filter(({ isPrimaryKey }) => !isPrimaryKey)
          .find(f => f.path === path || f.path === value);
      })
    );
  };

  const getOptionValue = option => {
    return option.path || option.value;
  };

  const getOptions = () => {
    // remove the `options` key from select type fields
    return list.fields.filter(({ isPrimaryKey }) => !isPrimaryKey).map(f => omit(f, ['options']));
  };

  const options = getOptions();

  const hasWarnings = countArrays(validationWarnings);
  const hasErrors = countArrays(validationErrors);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      closeOnBlanketClick
      heading={`Update ${list.formatCount(items)}`}
      onKeyDown={onKeyDown}
      slideInFrom="left"
      footer={
        <Fragment>
          <LoadingButton
            appearance={hasWarnings && !hasErrors ? 'warning' : 'primary'}
            isDisabled={hasErrors}
            isLoading={isLoading}
            onClick={onUpdate}
          >
            {hasWarnings && !hasErrors ? 'Ignore Warnings and Update' : 'Update'}
          </LoadingButton>
          <Button appearance="warning" variant="subtle" onClick={onClose}>
            Cancel
          </Button>
        </Fragment>
      }
    >
      <FieldContainer>
        <FieldLabel field={{ label: 'Fields', config: { isRequired: false } }} />
        <FieldInput>
          <Select
            autoFocus
            isMulti
            menuPosition="fixed"
            onChange={handleSelect}
            options={options}
            tabSelectsValue={false}
            value={selectedFields}
            getOptionValue={getOptionValue}
            //filterOption={filterOption} FIXME: this doesn't exist anymore
          />
        </FieldInput>
      </FieldContainer>
      {selectedFields.map((field, i) => {
        return (
          <Suspense
            fallback={<LoadingIndicator css={{ height: '3em' }} size={12} />}
            key={field.path}
          >
            <Render>
              {() => {
                let [Field] = field.adminMeta.readViews([field.views.Field]);
                let onChange = useCallback(
                  value => {
                    setItem({
                      ...item,
                      [field.path]: value,
                    });
                    setValidationErrors({});
                    setValidationWarnings({});
                  },
                  [field]
                );
                return useMemo(
                  () => (
                    <Field
                      autoFocus={!i}
                      field={field}
                      value={item[field.path]}
                      // Explicitly pass undefined here as it doesn't make
                      // sense to pass in any one 'saved' value
                      savedValue={undefined}
                      errors={validationErrors[field.path] || []}
                      warnings={validationWarnings[field.path] || []}
                      onChange={onChange}
                      renderContext="dialog"
                      CreateItemModal={CreateItemModal}
                    />
                  ),
                  [
                    i,
                    field,
                    item[field.path],
                    validationErrors[field.path],
                    validationWarnings[field.path],
                    onChange,
                  ]
                );
              }}
            </Render>
          </Suspense>
        );
      })}
    </Drawer>
  );
};

export default function UpdateManyModalWithMutation(props) {
  const { list } = props;
  const [updateItem, { loading }] = useMutation(list.updateManyMutation);

  return <UpdateManyModal updateItem={updateItem} isLoading={loading} {...props} />;
}

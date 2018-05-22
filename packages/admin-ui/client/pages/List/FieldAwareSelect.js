import React, { Component } from 'react';
import Select from 'react-select';

const selectStyles = {
  control: provided => ({ ...provided, minWidth: '200px' }),
  menu: () => ({ marginTop: 8 }),
};

export type SelectProps = {
  fields: any,
  onChange: any,
  value: any,
};

/**
 * Handy little bridge that converts a list's fields into the format that
 * react-select expects, then converts them back before calling onChange. This
 * is necessary because fields can contain an 'options' property which causes
 * react-select to interpret it as an option-group.
 */
export default class FieldAwareSelect extends Component<SelectProps> {
  handleChange = selected => {
    const { fields, isMulti, onChange } = this.props;
    const selectedFields = isMulti
      ? selected.map(({ value }) => fields.find(({ path }) => path === value))
      : fields.find(({ path }) => path === selected.value);
    onChange(selectedFields);
  };

  render() {
    const {
      components,
      fields,
      innerRef,
      onChange,
      value,
      ...props
    } = this.props;

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
        backspaceRemovesValue={false}
        captureMenuScroll={false}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        isClearable={false}
        menuIsOpen
        menuShouldScrollIntoView={false}
        ref={innerRef}
        styles={selectStyles}
        tabSelectsValue={false}
        components={{
          ...components,
          DropdownIndicator: null,
          IndicatorSeparator: null,
          SingleValue: () => null,
          MultiValue: () => null,
        }}
        {...props}
        onChange={this.handleChange}
        options={options}
        value={selected}
      />
    );
  }
}

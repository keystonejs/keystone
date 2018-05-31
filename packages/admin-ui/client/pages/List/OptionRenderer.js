import React, { Component } from 'react';
import Select, { components as reactSelectComponents } from 'react-select';
import { SearchIcon } from '@keystonejs/icons';
import { OptionPrimitive } from './components';

const selectStyles = {
  control: provided => ({ ...provided, minWidth: '200px' }),
  menu: () => ({ marginTop: 8 }),
};

const Control = ({ selectProps, ...props }) => {
  return selectProps.shouldDisplaySearchControl ? (
    <reactSelectComponents.Control {...props} />
  ) : (
    <div
      css={{
        border: 0,
        clip: 'rect(1px, 1px, 1px, 1px)',
        height: 1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        whiteSpace: 'nowrap',
        width: 1,
      }}
    >
      <reactSelectComponents.Control {...props} />
    </div>
  );
};

const DropdownIndicator = () => (
  <div css={{ marginRight: 2, marginTop: 2, textAlign: 'center', width: 32 }}>
    <SearchIcon />
  </div>
);

const defaultComponents = {
  Control,
  Option: OptionPrimitive,
  DropdownIndicator,
  // IndicatorSeparator: null,
};

export default class OptionRenderer extends Component {
  constructor(props) {
    super(props);
    this.cacheComponents(props.components);
  }
  static defaultProps = { displaySearch: true };
  componentWillReceiveProps(nextProps) {
    if (nextProps.components !== this.props.components) {
      this.cacheComponents(nextProps.components);
    }
  }
  cacheComponents = (components?: {}) => {
    this.components = {
      ...defaultComponents,
      ...components,
    };
  };
  render() {
    const { displaySearch, innerRef, ...props } = this.props;
    return (
      <Select
        backspaceRemovesValue={false}
        captureMenuScroll={false}
        closeMenuOnSelect={false}
        controlShouldRenderValue={false}
        shouldDisplaySearchControl={displaySearch}
        hideSelectedOptions={false}
        isClearable={false}
        maxMenuHeight={1000}
        menuIsOpen
        menuShouldScrollIntoView={false}
        ref={innerRef}
        styles={selectStyles}
        tabSelectsValue={false}
        {...props}
        components={this.components}
      />
    );
  }
}

const Cell = props => {
  if (!props.data) {
    return null;
  }
  return props.field.options.find(option => option.value === props.data).label;
};

export default Cell;

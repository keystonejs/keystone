const Cell = props => {
  return props.field.options.find(option => option.value === props.data).label;
};

export default Cell;

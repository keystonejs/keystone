const Cell = props => {
  if (!props.data) return null;
  return props.data.formattedAddress;
};

export default Cell;

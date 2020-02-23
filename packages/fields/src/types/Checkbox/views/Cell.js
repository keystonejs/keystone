const CheckboxCellView = ({ data }) => {
  if (data === true) return 'Checked';
  if (data === false) return 'Unchecked';
  return 'Not set';
};

export default CheckboxCellView;

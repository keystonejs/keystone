/** @jsx jsx */

import { useMemo } from 'react';
import { jsx } from '@emotion/core';
import { Options } from '@arch-ui/options';
import { arrayToObject } from '@keystonejs/utils';

function isOptionSelected(opt, selected) {
  return Boolean(selected.filter(x => x.path === opt.path).length);
}
function getOptionValue(opt) {
  return opt.path;
}

export const pseudoLabelField = { label: 'Label', path: '_label_' };

/**
 * Why does this exist?
 * --------------------
 * Because fields can contain an `options` property, which react-select
 * interprets as an OptionGroup.
 *
 * How does it solve the problem?
 * ------------------------------
 * By removing the `options` property before passing fields on to react-select,
 * and returning it during `onChange`.
 */
const FieldSelect = props => {
  const { fields: listFields, includeLabelField, isMulti, onChange } = props;

  const options = useMemo(() => {
    const sanitizedOptions = listFields.map(({ options, ...field }) => field);
    if (includeLabelField) {
      sanitizedOptions.unshift(pseudoLabelField);
    }

    return sanitizedOptions;
  }, [listFields, includeLabelField]);

  const handleChange = selected => {
    const arr = Array.isArray(selected) ? selected : [selected];
    const diffMap = arrayToObject(arr, 'path', () => true);
    const fields = [pseudoLabelField].concat(listFields).filter(i => diffMap[i.path]);
    const value = isMulti ? fields : fields[0];

    onChange(value);
  };

  return (
    <Options
      isOptionSelected={isOptionSelected}
      getOptionValue={getOptionValue}
      {...props}
      options={options}
      onChange={handleChange}
    />
  );
};

export default FieldSelect;

import React, { useState } from 'react';

import { POPOUT_GUTTER } from '../../../components/Popout';
import PopoutForm from './PopoutForm';

const EditFilterPopout = ({ filter, target, onChange }) => {
  const [value, setValue] = useState(filter.value);

  const onChangeFilter = value => {
    setValue(value);
  };

  const onSubmit = () => {
    if (value === null) return;

    onChange({
      field: filter.field,
      label: filter.label,
      type: filter.type,
      value,
    });
  };

  // Refs
  // ==============================
  let filterRef;

  const getFilterRef = ref => {
    if (ref) filterRef = ref;
  };

  let [Filter] = filter.field.adminMeta.readViews([filter.field.views.Filter]);
  const headerTitle = filter.field.getFilterLabel(filter);

  return (
    <PopoutForm target={target} headerTitle={headerTitle} onSubmit={onSubmit} showFooter>
      {({ ref }) => (
        <div ref={ref} style={{ padding: POPOUT_GUTTER }}>
          <Filter
            innerRef={getFilterRef}
            field={filter.field}
            filter={filter}
            onChange={onChangeFilter}
            value={value}
          />
        </div>
      )}
    </PopoutForm>
  );
};

export default EditFilterPopout;

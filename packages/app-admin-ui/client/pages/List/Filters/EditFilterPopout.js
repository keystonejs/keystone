import React, { useState, useRef, useMemo, useEffect } from 'react';

import { POPOUT_GUTTER } from '../../../components/Popout';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import PopoutForm from './PopoutForm';

const EditFilterPopout = ({ filter, target, onChange }) => {
  const [value, setValue] = useState(filter.value);

  const onSubmit = () => {
    if (filter.field.getFilterValue(value) === undefined) return;
    onChange({
      field: filter.field,
      label: filter.label,
      type: filter.type,
      value,
    });
  };

  // Refs
  // ==============================

  const filterRef = useRef();

  // TODO: see if we can do away with the ref. Without this, the filter loses focus while typing.
  useEffect(() => {
    if (filterRef.current) {
      filterRef.current.focus();
    }
  }, [filterRef.current]);

  const [Filter] = useMemo(() => filter.field.readViews([filter.field.views.Filter]), []);
  const headerTitle = filter.field.getFilterLabel(filter);

  return (
    <PopoutForm target={target} headerTitle={headerTitle} onSubmit={onSubmit} showFooter>
      {({ ref }) => (
        <div ref={ref} style={{ padding: `${POPOUT_GUTTER}px` }}>
          <ErrorBoundary>
            <Filter
              innerRef={filterRef}
              field={filter.field}
              filter={filter}
              onChange={setValue}
              value={value}
            />
          </ErrorBoundary>
        </div>
      )}
    </PopoutForm>
  );
};

export default EditFilterPopout;

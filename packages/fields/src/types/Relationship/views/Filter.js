import React from 'react';
import RelationshipSelect from './RelationshipSelect';

const EventCatcher = ({ children }) => (
  <div
    onClick={e => {
      e.preventDefault();
      e.stopPropagation();
    }}
  >
    {children}
  </div>
);

const RelationshipFilterView = ({ onChange, filter, field, value }) => {
  const handleChange = option => {
    if (option === null) {
      onChange(null);
    } else {
      const { value } = option;
      if (value) {
        onChange(value.id);
      }
    }
  };

  if (!filter) return null;

  const htmlID = `ks-input-${field.path}`;
  return (
    <EventCatcher>
      <RelationshipSelect
        field={field}
        renderContext={null}
        htmlID={htmlID}
        onChange={handleChange}
        value={value}
        isMulti={false}
      />
    </EventCatcher>
  );
};

export default RelationshipFilterView;

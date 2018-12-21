import React, { useState } from 'react';

export let LinkMenu = props => {
  let [value, setValue] = useState('');
  return (
    <form
      onSubmit={e => {
        e.stopPropagation();
        e.preventDefault();
        props.onSubmit(value);
      }}
    >
      <input
        value={value}
        onChange={e => {
          setValue(e.target.value);
        }}
      />
      <button type="submit">Submit</button>
      <button
        type="button"
        onClick={() => {
          props.onCancel();
        }}
      >
        Cancel
      </button>
    </form>
  );
};

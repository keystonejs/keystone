/** @jsx jsx */
import { jsx } from '@emotion/core';

export default function MultiCheckCell({ data }) {
  // This is the cell in the list table.
  // I will return a string of values like: "true, false, true"
  return Object.keys(data).map((label, i) => (
    <p key={`multicheckcell${label}-${i}`}>{data[label] ? `${label}: true` : `${label}: false`}</p>
  ));
}

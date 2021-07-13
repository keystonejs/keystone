import React, { Fragment, ReactNode } from 'react';

// We don't know what type of data we're getting back from a Virtual-field
// but I'd like to present it as best as possible.
// ToDo: Better presentation for more types of data

const stringify = (data: any) => {
  const omitTypename = (key: string, value: any) => (key === '__typename' ? undefined : value);
  const dataWithoutTypename = JSON.parse(JSON.stringify(data), omitTypename);
  return JSON.stringify(dataWithoutTypename, null, 2);
};
export function PrettyData({ data }: { data: any }) {
  if (!data) return null;

  let prettyData: ReactNode = '';
  if (typeof data === 'string') prettyData = data;
  else if (typeof data === 'number') prettyData = data;
  else if (typeof data === 'object') {
    prettyData = <pre>{stringify(data)}</pre>;
  } else {
    prettyData = <pre>{stringify(data)}</pre>;
  }

  return <Fragment>{prettyData}</Fragment>;
}

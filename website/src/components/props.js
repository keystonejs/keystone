import * as React from 'react';
import PrettyProps from 'pretty-proptypes';

export let Props = ({ component, ...props }) => {
  return <PrettyProps props={{ type: 'program', component: component.___types }} {...props} />;
};

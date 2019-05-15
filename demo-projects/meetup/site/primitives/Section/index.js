/** @jsx jsx */
import { jsx } from '@emotion/core';

export default function Section({ children, ...props }) {
  return <section {...props}>{children}</section>;
}

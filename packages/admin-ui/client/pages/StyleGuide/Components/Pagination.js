import React, { Fragment } from 'react';
import { Pagination } from '@voussoir/ui/src/primitives/navigation';

const PaginationGuide = () => (
  <Fragment>
    <h2>Pagination</h2>
    <Pagination total={256} displayCount />
  </Fragment>
);

export default PaginationGuide;

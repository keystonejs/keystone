import React, { Fragment } from 'react';
import { Pagination } from '@keystonejs/ui/src/primitives/navigation';

const PaginationGuide = () => (
  <Fragment>
    <h2>Pagination</h2>
    <Pagination total={256} displayCount />
  </Fragment>
);

export default PaginationGuide;

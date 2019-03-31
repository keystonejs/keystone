import React, { Fragment } from 'react';
import { Pagination } from '@arch-ui/pagination';

const PaginationGuide = () => (
  <Fragment>
    <h2>Pagination</h2>
    <Pagination total={256} displayCount />
  </Fragment>
);

export default PaginationGuide;

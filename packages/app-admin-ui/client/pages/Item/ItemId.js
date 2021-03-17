/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useItem } from '../../providers/Item';
import { IdCopy } from './IdCopy';

const ItemId = () => {
  let { id } = useItem();
  return <IdCopy id={id} />;
};

export default ItemId;

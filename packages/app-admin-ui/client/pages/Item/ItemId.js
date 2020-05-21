/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IdCopy } from './IdCopy';
import { useItem } from '../../providers/Item';

const ItemId = () => {
  let { id } = useItem();
  return <IdCopy id={id} />;
};

export default ItemId;

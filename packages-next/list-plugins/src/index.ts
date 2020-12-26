import { ListConfig, BaseGeneratedListTypes, BaseFields } from '@keystone-next/types';

// const { atTracking, createdAt, updatedAt } = require('./lib/tracking/atTracking');
// const { byTracking, createdBy, updatedBy } = require('./lib/tracking/byTracking');
// const { singleton } = require('./lib/limiting/singleton');
// const { logging } = require('./lib/logging');

import { withAtTracking } from './lib/tracking/atTracking';
import { withByTracking } from './lib/tracking/byTracking';

import { AtTrackingOptions, ByTrackingOptions } from './lib/types';

export function configureTracking<Fields extends BaseFields<BaseGeneratedListTypes>>({ atTracking, byTracking }: { atTracking?: AtTrackingOptions, byTracking?: ByTrackingOptions }): (listConfig: ListConfig<BaseGeneratedListTypes, Fields>) => ListConfig<BaseGeneratedListTypes, Fields> {
  return (listConfig: ListConfig<BaseGeneratedListTypes, Fields>): ListConfig<BaseGeneratedListTypes, Fields> => {
    return withByTracking(withAtTracking(listConfig, atTracking), byTracking);
  };
};

export { withAtTracking, withByTracking };
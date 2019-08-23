const { atTracking, createdAt, updatedAt } = require('./lib/tracking/atTracking');
const { byTracking, createdBy, updatedBy } = require('./lib/tracking/byTracking');
const trackingBase = require('./lib/tracking/trackingBase');

module.exports = {
  atTracking,
  createdAt,
  updatedAt,
  byTracking,
  createdBy,
  updatedBy,
  trackingBase,
};

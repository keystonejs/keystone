const { Relationship } = require('@keystone-alpha/fields');
const trackingBase = require('./trackingBase');

const fieldConfig = {
  type: Relationship,
  ref: 'User',
};

const createFieldFunc = ({ context: { authedItem: { id = null } = {} } } = {}) => id;

const createdByConfig = ({ createdByField = 'createdBy', ...options } = {}) => ({
  fieldConfig,
  createFieldFunc,
  ...options,
  createdField: createdByField,
});

const updatedByConfig = ({ updatedByField = 'updatedBy', ...options } = {}) => ({
  fieldConfig,
  updateFieldFunc: createFieldFunc,
  ...options,
  updatedField: updatedByField,
});

const createdBy = options => trackingBase({ ...createdByConfig(options) });
const updatedBy = options => trackingBase({ ...updatedByConfig(options) });
const byTracking = options =>
  trackingBase({
    ...createdByConfig(options),
    ...updatedByConfig(options),
  });

module.exports = { createdBy, updatedBy, byTracking };

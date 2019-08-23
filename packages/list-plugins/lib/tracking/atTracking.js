const { DateTime } = require('@keystone-alpha/fields');
const trackingBase = require('./trackingBase');

const fieldConfig = {
  type: DateTime,
  format: 'MM/DD/YYYY h:mm A',
};

const createFieldFunc = () => new Date().toISOString();

const createdAtConfig = ({ createdAtField = 'createdAt', ...options } = {}) => ({
  fieldConfig,
  createFieldFunc,
  ...options,
  createdField: createdAtField,
});

const updatedAtConfig = ({ updatedAtField = 'updatedAt', ...options } = {}) => ({
  fieldConfig,
  updateFieldFunc: createFieldFunc,
  ...options,
  updatedField: updatedAtField,
});

const createdAt = options =>
  trackingBase({ created: true, updated: false })({ ...createdAtConfig(options) });
const updatedAt = options =>
  trackingBase({ created: false, updated: true })({ ...updatedAtConfig(options) });
const atTracking = options =>
  trackingBase({ created: true, updated: true })({
    ...createdAtConfig(options),
    ...updatedAtConfig(options),
  });

module.exports = { createdAt, updatedAt, atTracking };

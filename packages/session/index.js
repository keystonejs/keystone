const {
  commonSessionMiddleware,
  createSessionMiddleware,
  restrictAudienceMiddleware,
  startAuthedSession,
  endAuthedSession,
} = require('./lib/session');

module.exports = {
  commonSessionMiddleware,
  createSessionMiddleware,
  restrictAudienceMiddleware,
  startAuthedSession,
  endAuthedSession,
};

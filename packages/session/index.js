const {
  commonSessionMiddleware,
  createSessionMiddleware,
  restrictAudienceMiddleware,
  startAuthedSession,
  endAuthedSession,
} = require('./src/session');

module.exports = {
  commonSessionMiddleware,
  createSessionMiddleware,
  restrictAudienceMiddleware,
  startAuthedSession,
  endAuthedSession,
};

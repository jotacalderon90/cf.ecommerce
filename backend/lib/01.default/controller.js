'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const response = require('cl.jotacalderon.cf.framework/lib/response');
const constants = require('./constants');

module.exports = {
  favicon: async function (req, res) {
    try {
      if (process.env.NODE_ENV === 'production' && process.env.FRONT_MULTIDOMAIN === '1') {
        const host_archivospublicos = req.headers.host.replace(/^([^.:]+)/, 'archivospublicos');
        res.redirect('https://' + host_archivospublicos + '/favicon.ico');
        return;
      }

      res.redirect(process.env.HOST_ARCHIVOSPUBLICOS + '/favicon.ico');
    } catch (error) {
      logger.error(error, req.headers.host);
      response.APIError(req, res, constants.error.rest.favicon + ' ' + constants.error.controlador);
    }
  },

  robots: async function (req, res) {
    try {
      res.setHeader('content-type', 'text/plain');
      res.send(
        'User-agent: *\n\Allow: /\n\nSitemap: ' +
          req.protocol +
          '://' +
          req.headers.host +
          '/sitemap.xml'
      );
    } catch (error) {
      logger.error(error, req.headers.host);
      response.APIError(req, res, constants.error.rest.robots + ' ' + constants.error.controlador);
    }
  },
};

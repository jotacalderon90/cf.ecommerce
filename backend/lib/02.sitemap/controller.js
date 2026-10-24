'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);

const constants = require('./constants');
const service = require('./service');

module.exports = {
  sitemap: async function (req, res) {
    let sitemap = '';
    try {
      sitemap = await service.sitemap(req.headers.host);
    } catch (error) {
      logger.error(constants.error.rest.sitemap + ' ' + constants.error.controlador, req.headers.host);
      logger.error(error, req.headers.host);
      sitemap = '';
    }

    res.set('Content-Type', 'text/xml');
    res.send(
      `<?xml version="1.0" encoding="UTF-8" ?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://${req.headers.host}</loc><lastmod>2022-03-18</lastmod></url>${sitemap}</urlset>`
    );
  },
};

'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const response = require('cl.jotacalderon.cf.framework/lib/response');

const constants = require('./constants');
const validator = require('./validator');
const service = require('./service');

const _domain = require('../domain');

module.exports = {
  total: async function (req, res) {
    try {
      const parseResult = validator.total.safeParse(req.query);
      if (!parseResult.success) {
        logger.error(parseResult, req.headers.host);
        response.renderError(req, res, constants.error.validacion);
        return;
      }

      const host = _domain.getParentDomain(req.headers.host);
      const domain = req.headers.host.split('.').slice(0, -2).join('.');

      const data = await service.total({
        ...parseResult.data,
        host,
        domain,
      });

      res.send({ data: data });
    } catch (error) {
      logger.error(error, req.headers.host);
      response.APIError(req, res, constants.error.rest.total + ' ' + constants.error.controlador);
    }
  },

  collection: async function (req, res) {
    try {
      const parseResult = validator.collection.safeParse(req.query);
      if (!parseResult.success) {
        logger.error(parseResult, req.headers.host);
        response.renderError(req, res, constants.error.validacion);
        return;
      }

      const host = _domain.getParentDomain(req.headers.host);
      const domain = req.headers.host.split('.').slice(0, -2).join('.');
      const __hostArchivosPublicos = _domain.getHostArchivosPublicos(req);

      const data = await service.collection({
        ...parseResult.data,
        host,
        domain,
        __hostArchivosPublicos,
      });

      res.send({ data: data });
    } catch (error) {
      logger.error(error, req.headers.host);
      response.APIError(
        req,
        res,
        constants.error.rest.collection + ' ' + constants.error.controlador
      );
    }
  },
};

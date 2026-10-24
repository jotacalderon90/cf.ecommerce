'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const response = require('cl.jotacalderon.cf.framework/lib/response');
const recaptcha = require('cl.jotacalderon.cf.framework/lib/recaptcha');

const _domain = require('../domain');
const _view = require('../view');

const constants = require('./constants');
const validator = require('./validator');
const service = require('./service');

module.exports = {
  view: async function (req, res) {
    try {
      
      const host = _domain.getParentDomain(req.headers.host);
      const __hostArchivosPublicos = _domain.getHostArchivosPublicos(req);
  
      res.render(await _view('ecommerce/cart/_', req.headers.host), {
        www: req.protocol + '://www.' + host,
        __hostArchivosPublicos
      });
      
    } catch (error) {
      logger.error(error, req.headers.host);
      response.renderError(req, res, constants.error.rest.view + ' ' + constants.error.controlador);
    }
  },
  
  api: async function (req, res) {
    try {
      
      const parseResult = validator.api.safeParse(req.body);
      
      if (!parseResult.success) {
        logger.error(parseResult, req.headers.host);
        response.renderError(req, res, constants.error.validacion);
        return;
      }
      
      if(process.env.RECAPTCHA_PRIVATE) {
        await recaptcha.validate(req);
      }
      
      const host = _domain.getParentDomain(req.headers.host);
      const domain = req.headers.host.split('.').slice(0, -2).join('.');
      const __hostArchivosPublicos = _domain.getHostArchivosPublicos(req);

      const data = await service.api({
        ...parseResult.data,
        host,
        domain,
        __hostArchivosPublicos,
        origin: req.headers.origin,
        headers_host: req.protocol + '://' + req.headers.host
      });
      
      res.send({ data: data });
      
    } catch (error) {
      logger.error(error, req.headers.host);
      response.APIError(req, res, constants.error.rest.api + ' ' + constants.error.controlador);
    }
  }
};

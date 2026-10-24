'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);

const _domain = require('../domain');
const _view = require('../view');

const constants = require('./constants');
const validator = require('./validator');
const service = require('./service');

module.exports = {
  
  webpay_start: async function(req,res) {
    const host = _domain.getParentDomain(req.headers.host);
    const __hostArchivosPublicos = _domain.getHostArchivosPublicos(req);
    try {
      
      const parseResult = validator.webpay_start.safeParse(req.params);
      
      if (!parseResult.success) {
        logger.error(parseResult, req.headers.host);
        res.status(400).render(await _view('message', host), {
          title: 'Error!',
          msg: constants.error.validacion,
          __hostArchivosPublicos,
        });
        return;
      }
      
      const domain = req.headers.host.split('.').slice(0, -2).join('.');
      
      const data = await service.webpay_start({
        ...parseResult.data,
        host,
        headers_host: req.protocol + '://' + req.headers.host
      });
      
      if(data.error) {
        logger.error(data, req.headers.host);
        res.status(400).render(await _view('message', host), {
          title: 'Error!',
          msg: data.msg,
          __hostArchivosPublicos,
        });
        return;
      }
      
      res.render('ecommerce/webpay/start', {
        webpay: data,
        __hostArchivosPublicos
      });
      
    } catch (error) {
      logger.error(error, req.headers.host);
      res.status(500).render(await _view('message', host), {
        title: 'Error!',
        msg: constants.error.rest.webpay_start + ' ' + constants.error.controlador,
        __hostArchivosPublicos,
      });
    }
  },
  
  webpay_end: async function (req, res) {
    const host = _domain.getParentDomain(req.headers.host);
    const domain = req.headers.host.split('.').slice(0, -2).join('.');
    const __hostArchivosPublicos = _domain.getHostArchivosPublicos(req);
    try {
      
      const parseResult = validator.webpay_end.safeParse(req.query);
      
      if (!parseResult.success) {
        logger.error(parseResult, req.headers.host);
        res.status(400).render(await _view('message', host), {
          title: 'Error!',
          msg: constants.error.validacion,
          __hostArchivosPublicos,
        });
        return;
      }
      
      const data = await service.webpay_end({
        ...parseResult.data,
        id: req.params.id,
        
        host,
        domain,
        __hostArchivosPublicos,
        origin: req.protocol + '://' + req.headers.host//como webpay no manda origin debo reemplazarlo por este mismo host que llamara a mailing
      });
      
      if(data.error) {
        logger.error(data, req.headers.host);
        res.status(400).render(await _view('message', host), {
          title: 'Error!',
          msg: data.msg,
          __hostArchivosPublicos,
        });
        return;
      }
      
      res.redirect('/pago/ok/' + data.msg);
      
    } catch (error) {
      logger.error(error, req.headers.host);
      res.status(500).render(await _view('message', host), {
        title: 'Error!',
        msg: constants.error.rest.webpay_end + ' ' + constants.error.controlador,
        __hostArchivosPublicos,
      });
    }
  },
  
  pago_ok: async function(req, res) {
    const host = _domain.getParentDomain(req.headers.host);
    const __hostArchivosPublicos = _domain.getHostArchivosPublicos(req);
    try {
      
      const parseResult = validator.pago_ok.safeParse(req.params);
      
      if (!parseResult.success) {
        logger.error(parseResult, req.headers.host);
        res.status(400).render(await _view('message', host), {
          title: 'Error!',
          msg: constants.error.validacion,
          __hostArchivosPublicos,
        });
        return;
      }
      
      
      const data = await service.pago_ok({
        ...parseResult.data,
        host
      });
      
      if(typeof data === 'string') {
        logger.error(data, req.headers.host);
        res.status(400).render(await _view('message', host), {
          title: 'Error!',
          msg: data,
          __hostArchivosPublicos,
        });
        return;
      }
      
      if(data) {
        res.render('ecommerce/webpay/ok', {
          order: parseResult.data.order,
          __hostArchivosPublicos
        });
      } else {
        res.render('ecommerce/webpay/notok', {
          order: parseResult.data.order,
          __hostArchivosPublicos
        });        
      }
      
    } catch (error) {
      logger.error(error, req.headers.host);
      res.status(500).render(await _view('message', host), {
        title: 'Error!',
        msg: constants.error.rest.pago_ok + ' ' + constants.error.controlador,
        __hostArchivosPublicos,
      });
    }
  }
};

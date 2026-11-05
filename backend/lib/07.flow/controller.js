'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);

const _domain = require('../domain');
const _view = require('../view');

const constants = require('./constants');
const validator = require('./validator');
const service = require('./service');

module.exports = {
  
  flow_start: async function(req,res) {
    const host = _domain.getParentDomain(req.headers.host);
    const __hostArchivosPublicos = _domain.getHostArchivosPublicos(req);
    try {
      
      const parseResult = validator.flow_start.safeParse(req.params);
      
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
      
      const data = await service.flow_start({
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
      
      res.redirect(data.url);
      /*
      res.render('ecommerce/webpay/start', {
        webpay: data,
        __hostArchivosPublicos
      });*/
      
    } catch (error) {
      logger.error(error, req.headers.host);
      res.status(500).render(await _view('message', host), {
        title: 'Error!',
        msg: constants.error.rest.flow_start + ' ' + constants.error.controlador,
        __hostArchivosPublicos,
      });
    }
  },
  
  flow_end: async function (req, res) {
    const host = _domain.getParentDomain(req.headers.host);
    const domain = req.headers.host.split('.').slice(0, -2).join('.');
    const __hostArchivosPublicos = _domain.getHostArchivosPublicos(req);
    try {
      
      const parseResult = validator.flow_end.safeParse(req.query);
      
      if (!parseResult.success) {
        logger.error(parseResult, req.headers.host);
        res.status(400).render(await _view('message', host), {
          title: 'Error!',
          msg: constants.error.validacion,
          __hostArchivosPublicos,
        });
        return;
      }
      
      const data = await service.flow_end({
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
        msg: constants.error.rest.flow_end + ' ' + constants.error.controlador,
        __hostArchivosPublicos,
      });
    }
  }
};

'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const response = require('cl.jotacalderon.cf.framework/lib/response');

const constants = require('./constants');
const validator = require('./validator');
const service = require('./service');

const _domain = require('../domain');

module.exports = {
  index: async function (req, res) {
    try {
      const host = _domain.getParentDomain(req.headers.host);
      const domain = req.headers.host.split('.').slice(0, -2).join('.');
      const __hostArchivosPublicos = _domain.getHostArchivosPublicos(req);

      const data = await service.index({
        host,
        domain,
        __hostArchivosPublicos,
      });

      if(!data.tags) {
        logger.error('no se encontró tags en index :O', req.headers.host);
      }

      res.render(data.view, {
        tags: data.tags,
        rows: data.rows,
        __hostArchivosPublicos,

        //toSeo
        title: 'Ecommerce de ' + req.headers.host.split('.')[1],
        description: 'Ecommerce de ' + req.headers.host.split('.')[1],
        keywords: 'Ecommerce,' + data.tags.join(','),
        author: '@' + req.headers.host,
        logo: __hostArchivosPublicos + '/assets/img/logo.png',
        img: __hostArchivosPublicos + '/assets/img/logo.png',
        www: req.protocol + '://www.' + host,
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,

        //toJSApi
        category_name: '',
      });
    } catch (error) {
      logger.error(error, req.headers.host);
      response.renderError(
        req,
        res,
        constants.error.rest.index + ' ' + constants.error.controlador
      );
    }
  },

  category: async function (req, res) {
    try {
      const parseResult = validator.category.safeParse(req.params);
      if (!parseResult.success) {
        logger.error(parseResult, req.headers.host);
        response.renderError(req, res, constants.error.validacion);
        return;
      }

      const host = _domain.getParentDomain(req.headers.host);
      const domain = req.headers.host.split('.').slice(0, -2).join('.');
      const __hostArchivosPublicos = _domain.getHostArchivosPublicos(req);

      const data = await service.category({
        ...parseResult.data,
        host,
        domain,
        __hostArchivosPublicos,
      });

      if(!data.tags) {
        logger.error('no se encontró tags en index :O', req.headers.host);
      }

      res.render(data.view, {
        tags: data.tags,
        rows: data.rows,
        __hostArchivosPublicos,

        //toSeo
        title: 'Ecommerce de ' + req.headers.host.split('.')[1],
        description: 'Registros de ' + host + ' acerca de ' + req.params.category_name,
        keywords: 'Ecommerce,' + data.tags.join(','),
        author: '@' + req.headers.host,
        logo: __hostArchivosPublicos + '/assets/img/logo.png',
        img: __hostArchivosPublicos + '/assets/img/logo.png',
        www: req.protocol + '://www.' + host,
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,

        //toJSApi
        category_name: req.params.category_name,
      });
    } catch (error) {
      logger.error(error, req.headers.host);
      response.renderError(
        req,
        res,
        constants.error.rest.category + ' ' + constants.error.controlador
      );
    }
  },

  document: async function (req, res) {
    try {
      const parseResult = validator.document.safeParse(req.params);
      if (!parseResult.success) {
        logger.error(parseResult, req.headers.host);
        response.renderError(req, res, constants.error.validacion);
        return;
      }

      const host = _domain.getParentDomain(req.headers.host);
      const domain = req.headers.host.split('.').slice(0, -2).join('.');
      const __hostArchivosPublicos = _domain.getHostArchivosPublicos(req);

      const data = await service.document({
        ...parseResult.data,
        host,
        domain,
        __hostArchivosPublicos,
      });
      
      if (data.error) {
        res.status(data.status).render(data.view, {
          ...data,
          __hostArchivosPublicos,
        });
        return;
      }
      
      if(!data.tags) {
        logger.error('no se encontró tags en index :O', req.headers.host);
      }

      res.render(data.view, {
        tags: data.tags,
        row: data.row,
        __hostArchivosPublicos,

        //toSeo
        title: data.row.title,
        description: data.row.resume,
        keywords: 'Ecommerce,' + data.row.tag.join(','),
        author: '@' + req.headers.host,
        logo: __hostArchivosPublicos + '/assets/img/logo.png',
        img: data.row.img,
        www: req.protocol + '://www.' + host,
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      });
    } catch (error) {
      logger.error(error, req.headers.host);
      response.renderError(
        req,
        res,
        constants.error.rest.document + ' ' + constants.error.controlador
      );
    }
  },
};

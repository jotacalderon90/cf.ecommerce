'use strict';

const crypto = require('crypto');

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const redis = require('cl.jotacalderon.cf.framework/lib/redis');

const tagastree = require('../tagastree');
const view = require('../view');
const { ecommerce, setting } = require('../_repository/_');

const constants = require('./constants');

//Algoritmo Fisher-Yates
const shuffleArray = (array) => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
};

module.exports = {
  index: async function (input) {
    try {
      const cacheKey = crypto
        .createHash('md5')
        .update(JSON.stringify(input).toLowerCase())
        .digest('hex');

      if (redis.client) {
        const cached = await redis.get(cacheKey);
        if (cached) return cached;
      }

      const settingHost = await setting.collection({
        host: input.host, 
        domain: input.domain
      });

      let tags;
      if (settingHost.length === 0) {
        tags = await ecommerce.tags('tag', {
          host: input.host, 
          domain: input.domain,
          active: true,
        });
      } else {
        tags = tagastree.getTagsBySetting('/', settingHost[0]);
      }

      const documentos = await ecommerce.getFirstRenderPage(
        input.host,
        input.domain,
        undefined,
        input.__hostArchivosPublicos
      );
      
      const respuesta = {
        view: await view('ecommerce/collection/_', input.domain + '.' + input.host),
        tags: tags,
        rows: documentos,
      };

      if (redis.client) {
        redis.set(cacheKey, respuesta, 900);
      }

      return respuesta;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.sitemap + ' ' + constants.error.servicio);
    }
  },
  category: async function (input) {
    try {
      const cacheKey = crypto
        .createHash('md5')
        .update(JSON.stringify(input).toLowerCase())
        .digest('hex');

      if (redis.client) {
        const cached = await redis.get(cacheKey);
        if (cached) return cached;
      }

      const settingHost = await setting.collection({
        host: input.host, 
        domain: input.domain
      });

      let tags;
      if (settingHost.length === 0) {
        tags = await ecommerce.tags('tag', {
          host: input.host, 
          domain: input.domain,
          active: true
        });
      } else {
        tags = tagastree.getTagsBySetting('/categoria/', settingHost[0], input.category_name);
      }

      const documentos = await ecommerce.getFirstRenderPage(
        input.host,
        input.domain,
        input.category_name,
        input.__hostArchivosPublicos
      );

      const respuesta = {
        view: await view('ecommerce/collection/_', input.domain + '.' + input.host),
        tags: tags,
        rows: documentos,
      };

      if (redis.client) {
        redis.set(cacheKey, respuesta, 900);
      }

      return respuesta;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.category + ' ' + constants.error.servicio);
    }
  },
  document: async function (input) {
    try {
      const cacheKey = crypto
        .createHash('md5')
        .update(JSON.stringify(input).toLowerCase())
        .digest('hex');

      if (redis.client) {
        const cached = await redis.get(cacheKey);
        if (cached) return cached;
      }

      const settingHost = await setting.collection({
        host: input.host, 
        domain: input.domain
      });

      let tags;
      if (settingHost.length === 0) {
        tags = await ecommerce.tags('tag', {
          host: input.host, 
          domain: input.domain,
          active: true,
        });
      } else {
        tags = tagastree.getTagsBySetting('/' + input.document_url, settingHost[0]);
      }

      const documentos = await ecommerce.getByUrl(
        input.host,
        input.domain,
        input.document_url,
        input.__hostArchivosPublicos
      );

      if (documentos.length != 1) {
        return {
          error: true,
          status: 404,
          view: await view('message', input.domain + '.' + input.host),
          msg:
            constants.error.rest.document_not_found +
            ' ' +
            input.document_url +
            ' - ' +
            documentos.length,
          title: 'Error 404',
          class: 'danger',
        };
      }
      
      const documento = documentos[0];

      const relations = await ecommerce.getRelation(
        input.host,
        input.domain,
        documento.tag_main,
        documento.title,
        input.__hostArchivosPublicos
      );

      documento.relation = shuffleArray(relations).slice(0, 2);
      
      const respuesta = {
        view: await view('ecommerce/document/_', input.domain + '.' + input.host),
        tags: tags,
        row: documento,
      };

      if (redis.client) {
        redis.set(cacheKey, respuesta, 900);
      }

      return respuesta;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.document + ' ' + constants.error.servicio);
    }
  },
};

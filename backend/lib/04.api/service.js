'use strict';

const crypto = require('crypto');

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);

const ttl = 900; //15min
let redis = null;
try {
  //redis = require('cl.jotacalderon.cf.framework/lib/redis');
} catch {
  logger.warn('Redis no disponible, caché deshabilitado');
}

const constants = require('./constants');

const { ecommerce } = require('../_repository/_');

module.exports = {
  total: async function (input) {
    try {
      const cacheKey = crypto
        .createHash('md5')
        .update(JSON.stringify(input).toLowerCase())
        .digest('hex');

      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) return cached;
      }

      const respuesta = await ecommerce.totalToApi(input.host, input.domain, input.category_name);

      if (redis) {
        redis.set(cacheKey, respuesta, ttl);
      }

      return respuesta;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.sitemap + ' ' + constants.error.servicio);
    }
  },
  collection: async function (input) {
    try {
      const cacheKey = crypto
        .createHash('md5')
        .update(JSON.stringify(input).toLowerCase())
        .digest('hex');

      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) return cached;
      }

      const respuesta = await ecommerce.getCollectionToAPI(
        input.host,
        input.domain,
        input.category_name,
        input.skip,
        input.sort_field,
        input.sort_type,
        input.__hostArchivosPublicos
      );

      if (redis) {
        redis.set(cacheKey, respuesta, ttl);
      }

      return respuesta;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.collection + ' ' + constants.error.servicio);
    }
  },
};

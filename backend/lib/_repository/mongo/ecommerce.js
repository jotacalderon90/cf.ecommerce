'use strict';

const { DateTime } = require('luxon');

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');

//const AppError = require('../../error');

const constants = require('../constants');

const mapRow = function (row) {
  row.id = row._id.toString();

  row.datefromnow = DateTime.fromISO(row.created, { zone: 'utc' }).setLocale('es').toRelative();
  row.datetitle = DateTime.fromISO(row.created).toFormat('cccc, dd LLLL yyyy, h:mm:ss');

  row.img =
    row.__hostArchivosPublicos +
    '/assets/img/ecommerce/' +
    row.domain +
    '.' +
    row.host +
    '/' +
    row.id +
    '.jpg';

  row.created = DateTime.fromISO(row.created, { zone: 'utc' }).toFormat('yyyy-MM-dd');
  row.updated = DateTime.fromISO(row.updated || row.created, { zone: 'utc' }).toFormat(
    'yyyy-MM-dd'
  );
  
  row.price_display = Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(row.price);

  return row;
};

//const validId = /^[a-f0-9]{24}$/;

const name_collection = 'ecommerce';

const defaultProjection = {
  title: 1,
  uri: 1,
  resume: 1,
  tag: 1,
  created: 1,
  host: 1,
  domain: 1,
  price: 1
};

const defaultLimit = 6;

module.exports = {
  total: async function (query, options) {
    try {
      const total = await mongodb.count(name_collection, query, options);

      if (isNaN(total)) {
        throw new Error(total);
      }

      return total;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.total + ' ' + constants.error.repositorio);
    }
  },

  collection: async function (query, options, asCursor, __hostArchivosPublicos) {
    try {
      const collection = await mongodb.find(name_collection, query, options, asCursor);

      if (asCursor) {
        return collection;
      }

      if (!Array.isArray(collection)) {
        throw new Error(collection);
      }

      return collection.map((row) => {
        row.__hostArchivosPublicos = __hostArchivosPublicos;
        return mapRow(row);
      });
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.collection + ' ' + constants.error.repositorio);
    }
  },

  tags: async function (field, query) {
    try {
      const tags = await mongodb.distinct(name_collection, field, query);

      if (!Array.isArray(tags)) {
        throw new Error(tags);
      }

      return tags;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.tags + ' ' + constants.error.repositorio);
    }
  },

  create: async function () {
    throw new Error('no implementado');
  },

  read: async function () {
    throw new Error('no implementado');
  },

  update: async function () {
    throw new Error('no implementado');
  },

  delete: async function () {
    throw new Error('no implementado');
  },

  /************************/
  /*Metodos para ECOMMERCE*/
  /************************/

  getFirstRenderPage: async function (host, domain, category, __hostArchivosPublicos) {
    try {
      const collection = await this.collection(
        {
          host: host,
          domain: domain,
          ...(category ? { tag: category } : {}),
          active: true,
        },
        {
          projection: defaultProjection,
          sort: {
            created: -1,
            title: 1,
          },
          limit: defaultLimit,
        },
        false,
        __hostArchivosPublicos
      );

      return collection;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.collection + ' ' + constants.error.repositorio);
    }
  },

  getByUrl: async function (host, domain, url, __hostArchivosPublicos) {
    try {
      const collection = await this.collection(
        {
          host: host,
          domain: domain,
          uri: url,
          active: true,
        },
        {},
        false,
        __hostArchivosPublicos
      );

      return collection;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.collection + ' ' + constants.error.repositorio);
    }
  },

  getRelation: async function (host, domain, tag_main, title, __hostArchivosPublicos) {
    try {
      const collection = await this.collection(
        {
          host: host,
          domain: domain,
          tag: {
            $in: [tag_main],
          },
          title: {
            $ne: title,
          },
          active: true,
        },
        {
          projection: defaultProjection,
          limit: defaultLimit,
        },
        false,
        __hostArchivosPublicos
      );

      return collection;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.collection + ' ' + constants.error.repositorio);
    }
  },

  totalToApi: async function (host, domain, category_name) {
    try {
      const total = await this.total({
        host: host,
        domain: domain,
        ...(category_name ? { tag: category_name } : {}),
        active: true,
      });
      return total;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.total + ' ' + constants.error.repositorio);
    }
  },

  getCollectionToAPI: async function (
    host,
    domain,
    category,
    skip,
    sort_field,
    sort_type,
    __hostArchivosPublicos
  ) {
    try {
      let sort = {
        created: -1,
        title: 1,
      };
      if (sort_field) {
        sort = {};
        sort[sort_field] = sort_type;
      }

      const collection = await this.collection(
        {
          host: host,
          domain: domain,
          ...(category ? { tag: category } : {}),
          active: true,
        },
        {
          projection: defaultProjection,
          sort: sort,
          limit: defaultLimit,
          skip: skip,
        },
        false,
        __hostArchivosPublicos
      );

      return collection;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.collection + ' ' + constants.error.repositorio);
    }
  },
  
  getCollectionToEcommerce: async function(host, domain, ids, __hostArchivosPublicos) {
    try {
      
      const collection = await this.collection(
        {
          host: host,
          domain: domain,
          active: true,
          _id: { $in: ids.map(id => mongodb.toId(id)) }
        },
        {
          projection: {
            title: 1,
            price: 1,
            domain: 1,
            host: 1
          }
        },
        false,
        __hostArchivosPublicos
      );
      
      return collection;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.collection + ' ' + constants.error.repositorio);
    }
  }
};

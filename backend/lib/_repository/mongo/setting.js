'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');

//const AppError = require('../../error');

const constants = require('../constants');

const mapRow = function (row) {
  row.id = row._id.toString();
  delete row._id;
  return row;
};

//const validId = /^[a-f0-9]{24}$/;

const name_collection = 'setting';

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

  collection: async function (query, options, asCursor) {
    try {
      const collection = await mongodb.find(name_collection, query, options, asCursor);

      if (asCursor) {
        return collection;
      }

      if (!Array.isArray(collection)) {
        throw new Error(collection);
      }

      return collection.map(mapRow);
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
};

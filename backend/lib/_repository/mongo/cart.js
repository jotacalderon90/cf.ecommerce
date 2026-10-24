'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');

//const AppError = require('../../error');

const constants = require('../constants');

const mapRow = function (row) {
  row.id = row._id.toString();
  return row;
};

//const validId = /^[a-f0-9]{24}$/;

const name_collection = 'cart';

module.exports = {
  
  total: async function () {
    throw new Error('no implementado');
  },

  collection: async function () {
    throw new Error('no implementado');
  },

  tags: async function () {
    throw new Error('no implementado');
  },

  create: async function (input) {
    try {
      
      const nuevoCart = {};

      nuevoCart.host = input.host;
      nuevoCart.created = input.created;
      nuevoCart.type = input.type;
      nuevoCart.buyOrder = input.buyOrder;
      nuevoCart.sessionId = input.sessionId;
      nuevoCart.to = input.to;
      nuevoCart.message = input.message;
      nuevoCart.product = input.product;
      nuevoCart.sumatoria = input.sumatoria;//tipo number
      nuevoCart.total = input.total;//tipo string formateado
      nuevoCart.payment_link = input.payment_link;
      
      const created = await mongodb.insertOne(name_collection, nuevoCart);

      if (!created.acknowledged) {
        throw new Error(created);
      }

      return created.insertedId.toString();
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.create + ' ' + constants.error.repositorio);
    }
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

  /*******************/
  /*Metodos para CART*/
  /*******************/

  findFromWebpay: async function (buyOrder, sessionId) {
    try {
      const collection = await mongodb.find(name_collection, {
        buyOrder: buyOrder, 
        sessionId: sessionId 
      });

      if (!Array.isArray(collection)) {
        throw new Error(collection);
      }
      
      if (collection.length == 0) {
        return null;
      }

      return collection.map(mapRow);
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.read + ' ' + constants.error.repositorio);
    }
  },
  
  updateSession: async function (id, sessionId) {
    try {
      const updated = await mongodb.updateOne(name_collection, id, { 
        $set: {
          sessionId: sessionId
        } 
      });
      
      if (!updated.acknowledged) {
        throw new Error(updated);
      }
      
      return updated.modifiedCount;
      
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.update + ' ' + constants.error.repositorio);
    }
  },
  
  updateWebpayResponse: async function (id, webpay_response) {
    try {
      const updated = await mongodb.updateOne(name_collection, id, { 
        $set: {
          webpay_response: webpay_response
        } 
      });
      
      if (!updated.acknowledged) {
        throw new Error(updated);
      }
      
      return updated.modifiedCount;
      
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.update + ' ' + constants.error.repositorio);
    }
  },
  
  findByOrder: async function (buyOrder) {
    try {
      const collection = await mongodb.find(name_collection, {
        buyOrder: buyOrder 
      });

      if (!Array.isArray(collection)) {
        throw new Error(collection);
      }
      
      if (collection.length == 0) {
        return null;
      }

      return collection.map(mapRow);
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.read + ' ' + constants.error.repositorio);
    }
  },
  

};

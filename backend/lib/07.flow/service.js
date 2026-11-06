'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const request = require('cl.jotacalderon.cf.framework/lib/request');

const { cart } = require('../_repository/_');
const flow = require('../flow');

const constants = require('./constants');

module.exports = {
  
  flow_start: async function(input) {
    try {
      
      const cartDocument = await cart.findByOrder(input.order);
      
      if(cartDocument == null) {
        return {
          error: true,
          msg: constants.error.rest.cart_notfound + ' ' + constants.error.servicio
        };
      }
      
      if(cartDocument.length != 1) {
        return {
          error: true,
          msg: constants.error.rest.cart_badlength + ' ' + cartDocument.length + ' ' + constants.error.servicio
        };
      }
      
      if(cartDocument[0].ecommerce_response && cartDocument[0].ecommerce_response.status === 'AUTHORIZED') {
        return {
          error: true,
          msg: constants.error.rest.cart_proccesed + ' ' + constants.error.servicio
        };
      }
      
      const newSessionId = `SES-${cartDocument[0].buyOrder}-${Date.now()}`;
      
      const updated = await cart.updateSession(cartDocument[0].id, newSessionId);
      
      if(updated != 1) {        
        return {
          error: true,
          msg: constants.error.rest.cart_notupdated + ' ' + constants.error.servicio
        };
      }
      
      const confirmationUrl = `${input.headers_host}/api/flow/end/${cartDocument[0].buyOrder}/${newSessionId}`;
      
      const tbk = await flow.crearTransaccion(input.host, cartDocument[0].buyOrder, newSessionId, cartDocument[0].sumatoria, confirmationUrl, {
        email: cartDocument[0].to,
        subject: cartDocument[0].message,
        confirmationUrl: confirmationUrl
      });
      
      return {
        url:   tbk.url,
        token: tbk.token,
      };
      
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.flow_start + ' ' + constants.error.servicio);
    }
  },
  
  flow_end: async function (input) {
    try {
      
      const carts = await cart.findByOrderSession(input.order, input.sessionId);
      
      if (carts == null) {
        return { 
          error: true, 
          msg: constants.error.rest.cart_notfound + ' ' + constants.error.servicio 
        };
      }
      
      if (carts.length != 1) {
        return { 
          error: true, 
          msg: constants.error.rest.cart_badlength + carts.length + ' ' + constants.error.servicio 
        };
      }
      
      // Idempotencia: ya procesado → no reenviar correo
      if (carts[0].ecommerce_response?.status === 'AUTHORIZED') {
        return { 
          error: false, 
          msg: carts[0].buyOrder 
        };
      }

      const cartDocument = carts[0];
      
      const flowResponse = await flow.confirmarTransaccion(input.host, input.token);
      
      if (flowResponse.status === 'PENDING') {
        return { 
          error: true, 
          pending: true,  
          msg: constants.error.rest.flow_pending + ' ' + constants.error.servicio 
        };
      }
      
      if (flowResponse.status === 'REJECTED') {
        return { 
          error: true, 
          msg: constants.error.rest.flow_rejected + ' ' + constants.error.servicio 
        };
      }
      if (flowResponse.status === 'CANCELLED') {
        return { 
          error: true, 
          msg: constants.error.rest.flow_aborted + ' ' + constants.error.servicio 
        }; 
      }

      if (!flowResponse.approved) {
        return { 
          error: true, 
          msg: constants.error.rest.cart_notproccesed + ' ' + constants.error.servicio 
        };
      }
      if (flowResponse.amount != parseFloat(cartDocument.sumatoria)) {
        return { 
          error: true, 
          msg: constants.error.rest.cart_notvalidmount + ' ' + constants.error.servicio 
        };
      }
      
      const updated = await cart.updateEcommerceResponse(cartDocument.id, flowResponse);
      if (updated != 1) {
        return { 
          error: true, 
          msg: constants.error.rest.cart_notupdated + ' ' + constants.error.servicio 
        };
      }
      
      const newmail = {...cartDocument};
      delete newmail.payment_link;
      newmail.payment_ok = true;
      newmail.idCart = cartDocument.id;
      newmail.email = cartDocument.to;
      newmail.subject = 'Pedido #' + cartDocument.buyOrder + ' pagado exitosamente';
      newmail.template = 'ecommerce.new-cotization.html';
      const hostMailing = (process.env.NODE_ENV === 'production' && process.env.FRONT_MULTIDOMAIN === '1') ? 'https://mailing.' + input.host : process.env.HOST_MAILING;
      const respuesta = await request.post(
        hostMailing + '/api/mailing', {
          headers: {
            'user-agent': 'cf.ecommerce',
            origin: input.origin
          },
        } , {
          ...input,
          ...newmail
        }
      );
      
      if (respuesta.error) {
        logger.error('al notificar compra exitosa, sistema de correos arrojo error');
        logger.error(respuesta.error);
      }
      
      if (respuesta.data.statusCode != 200) {
        logger.error('al notificar compra exitosa, sistema de correos no retorno 200');
        logger.error(respuesta);
      }
      
      //Pago ok :D
      return {
        error: false,
        msg: cartDocument.buyOrder
      };  
        
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.flow_end + ' ' + constants.error.servicio);
    }
  },

};

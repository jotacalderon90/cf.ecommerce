'use strict';

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const request = require('cl.jotacalderon.cf.framework/lib/request');

const { cart } = require('../_repository/_');
const webpay = require('../webpay');

const constants = require('./constants');

module.exports = {
  
  webpay_start: async function(input) {
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
      
      if(cartDocument[0].webpay_response && cartDocument[0].webpay_response.status === 'AUTHORIZED') {
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
      
      const tbk = await webpay.crearTransaccion(input.host, cartDocument[0].buyOrder, newSessionId, cartDocument[0].sumatoria, `${input.headers_host}/api/webpay/end/${cartDocument[0].id}`);
      
      return {
        url:   tbk.url,
        token: tbk.token,
      };
      
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.webpay_start + ' ' + constants.error.servicio);
    }
  },
  
  webpay_end: async function (input) {
    try {
      
      if(input.token_ws && input.TBK_TOKEN) {
        //timeout          
        return {
          error: true,
          msg: constants.error.rest.webpay_timeout + ' ' + constants.error.servicio
        };
        
      } else if(input.TBK_TOKEN) {
        //aborted desde webpay
        return {
          error: true,
          msg: constants.error.rest.webpay_aborted + ' ' + constants.error.servicio
        };
        
      } else if(input.token_ws) {
        //ok, procesar carrito
        
        let webpay_response = null;
        try {
          webpay_response = await webpay.confirmarTransaccion(input.host, input.token_ws);
        } catch (error) {
          logger.error('Error al confirmar transacción');
          logger.error(error);
        }
        
        if (webpay_response === null) {
          return {
            error: true,
            msg: constants.error.rest.cart_notproccesed + ' ' + constants.error.servicio
          };
        }
        
        const cartDocument = await cart.findFromWebpay(webpay_response.buy_order, webpay_response.session_id);
        
        if(cartDocument == null) {
          return {
            error: true,
            msg: constants.error.rest.cart_notfound + ' ' + constants.error.servicio
          };
        }
        
        if(cartDocument.length != 1) {
          return {
            error: true,
            msg: constants.error.rest.cart_badlength + cartDocument.length + ' ' + constants.error.servicio
          }
        }
        
        const updated = await cart.updateWebpayResponse(cartDocument[0].id, webpay_response);
        
        if(updated != 1) {        
          return {
            error: true,
            msg: constants.error.rest.cart_notupdated + ' ' + constants.error.servicio
          };
        }
        
        //Pagado
        if(webpay_response.response_code === 0 && webpay_response.status === 'AUTHORIZED') {
          
          //Monto inválido :O
          if(webpay_response.amount != parseFloat(cartDocument[0].sumatoria)) {
            return {
              error: true,
              msg: constants.error.rest.cart_notvalidmount + ' ' + constants.error.servicio
            };
          }
          
              
          const newmail = {...cartDocument[0]};
          delete newmail.payment_link;
          newmail.payment_ok = true;
          newmail.idCart = cartDocument[0].id;
          newmail.email = cartDocument[0].to;
          newmail.subject = 'Pedido #' + cartDocument[0].buyOrder + ' pagado exitosamente';
          newmail.template = 'ecommerce.new-cotization.html';
          const hostMailing = (process.env.NODE_ENV === 'production' && process.env.FRONT_MULTIDOMAIN === '1') ? 'https://mailing.' + input.host : process.env.HOST_MAILING;
          const respuesta = await request.post(
            hostMailing + '/api/mailing',
            {
              headers: {
                'user-agent': 'cf.ecommerce',
                origin: input.origin
              },
            },
            {
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
            msg: cartDocument[0].buyOrder
          };  
        //Abortado desde el banco
        } else if (webpay_response.response_code === -1 && webpay_response.status === 'FAILED') {
          return {
            error: true,
            msg: constants.error.rest.webpay_aborted + ' ' + constants.error.servicio
          };
        }
      } 
      
      //Error por defecto
      return {
        error: true,
        msg: constants.error.rest.cart_notproccesed + ' ' + constants.error.servicio
      };
      
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.webpay_end + ' ' + constants.error.servicio);
    }
  },
  
  pago_ok: async function (input) {
    try {
      
      const cartDocument = await cart.findByOrder(input.order);
      
      if(cartDocument == null) {
        return constants.error.rest.cart_notfound + ' ' + constants.error.servicio;
      }
      
      if(cartDocument.length != 1) {
        return constants.error.rest.cart_badlength + cartDocument.length + ' ' + constants.error.servicio;
      }
      
      return cartDocument[0].webpay_response.status === 'AUTHORIZED';
      
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.pago_ok + ' ' + constants.error.servicio);
    }
  }
};

'use strict';

const { DateTime } = require('luxon');

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const request = require('cl.jotacalderon.cf.framework/lib/request');

const { ecommerce, cart } = require('../_repository/_');
const webpay = require('../webpay');

const constants = require('./constants');

module.exports = {
  view: async function (input) {
    try {
      
      const respuesta = await blog.totalToApi(input.host, input.domain, input.category_name);

      return respuesta;
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.view + ' ' + constants.error.servicio);
    }
  },
  
  api: async function (input) {
    try {
      
      //formatear pedido (solo viene id y cantidad)
      //se necesita title,img,price,total
      let productosDB = await ecommerce.getCollectionToEcommerce(input.host, input.domain, input.product.map(r => r.id), input.__hostArchivosPublicos);
      productosDB = productosDB.map(p => {
        const found = input.product.find(x => x.id === p.id);
        return { ...p, cant: found ? found.cant : 0 };
      });
      
      if(productosDB.length != input.product.length) {
        return constants.error.rest.api_products_length;
      }
      
      let sumatoria = 0;
      const productosToMailing = productosDB.map((producto)=>{
        const total = producto.price * producto.cant;
        sumatoria += total;
        return {
          title: producto.title,
          img: producto.img,
          price: producto.price,
          cant: producto.cant,
          total: total
        }
      });
      
      const created = DateTime.now();
      
      const newCart = {};
      newCart.host = input.host;
      newCart.created = created.toJSDate();
      //newCart.type = (input.buy) ? 'OC' : 'COT';
      newCart.buyOrder = /*newCart.type + '-' + */created.toFormat('yyyyMMddHHmmss');
      //newCart.sessionId = `SES-${newCart.buyOrder}-${Date.now()}`;
      newCart.to = input.email;
      newCart.message = input.message;
      newCart.product = productosToMailing.map((producto)=>{
        producto.price = new Intl.NumberFormat().format(producto.price);
        producto.cant = new Intl.NumberFormat().format(producto.cant);
        producto.total = new Intl.NumberFormat().format(producto.total);
        return producto;
      });
      newCart.sumatoria = sumatoria;
      newCart.total = new Intl.NumberFormat().format(sumatoria);
      
      const webpay_hasDomain = await webpay.has(input.host)
      if(webpay_hasDomain) {
        newCart.payment_link = input.headers_host + `/api/webpay/start/${newCart.buyOrder}`;
      }
      
      const cartCreated = await cart.create(newCart);
      
      const newmail = {...newCart};
      newmail.idCart = cartCreated;
      newmail.subject = input.subject || 'Transacción desde ' + input.origin;
      newmail.template = input.template || 'ecommerce.new-cotization.html';
      
      const host = (process.env.NODE_ENV === 'production' && process.env.FRONT_MULTIDOMAIN === '1') ? 'https://mailing.' + input.host : process.env.HOST_MAILING;
      const respuesta = await request.post(
        host + '/api/mailing',
        {
          headers: {
            'user-agent': 'cf.ecommerce',
            origin: input.origin,
          },
        },
        {
          ...input,
          ...newmail,
        }
      );

      if (respuesta.error) {
        throw new Error(respuesta.error);
      }

      if (respuesta.data.statusCode != 200) {
        throw new Error(constants.error.rest.servicio_correo + ' ' + respuesta.data.statusCode);
      }
      
      return true;
      
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.api + ' ' + constants.error.servicio);
    }
  }
};

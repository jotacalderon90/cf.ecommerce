'use strict';

const {
  WebpayPlus,
  Options,
  IntegrationApiKeys,
  Environment,
  IntegrationCommerceCodes
} = require('transbank-sdk');

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const request = require('cl.jotacalderon.cf.framework/lib/request');

// Funcion que valida si existe configuracion webpay, utilizado cuando se genera la cotización
async function has(host, getFile) {
  try {
    
    const hostArchivosPrivadosProduction = 'https://' + 'archivosprivados.' + host;
    const hostArchivosPrivados = (process.env.NODE_ENV === 'production' && process.env.FRONT_MULTIDOMAIN === '1') ? hostArchivosPrivadosProduction : process.env.HOST_ARCHIVOSPRIVADOS;
    
    const respuesta = await request.get(
      hostArchivosPrivados + '/api/integration/get/L2FyY2hpdm9zcHJpdmFkb3MvY29uZmlndXJhY2lvbmVzL3dlYnBheS5qc29u',
      {
        headers: {
          'user-agent': 'cf.ecommerce',
          'origin': 'ecommerce.' + host
        },
      }
    );
    
    switch(respuesta.data.statusCode) {
      case 404:
        return false;
      break;
      case 200:
        if(getFile) {
          return JSON.parse(respuesta.data.body);
        }
        return true;
      break;
    }
    
    throw new Error(respuesta);
    
  } catch(error) {
    logger.error(error);
    return false;
  }
}

// Funcion que retorna objeto webpay, utilizada cuando se pincha boton pagar en el correo :)
async function getWebpay(host) {
  
  const webpayJson = await has(host,true);
  if(webpayJson) {
    
    const isProduction = webpayJson.TBK_ENV === 'production';

    const options = isProduction
      ? new Options(
          webpayJson.TBK_API_KEY_ID,
          webpayJson.TBK_API_KEY_SECRET,
          Environment.Production
        )
      : new Options(
          IntegrationCommerceCodes.WEBPAY_PLUS,
          IntegrationApiKeys.WEBPAY,
          Environment.Integration
        );
    
    const wp = new WebpayPlus.Transaction(options);
    return wp;
    
  }
}

// Crear transacción
async function crearTransaccion(host, buyOrder, sessionId, mount, returnUrl) {
  const webpay = await getWebpay(host);
  const response = webpay.create(
    buyOrder,
    sessionId,
    mount,
    returnUrl
  );

  // response.url   → URL del formulario Webpay
  // response.token → token de la transacción
  return response;
}

// Confirmar transacción (después del retorno del usuario)
async function confirmarTransaccion(host, token) {
  const webpay = await getWebpay(host);
  const response = webpay.commit(token);

  // response.response_code === 0  → aprobada
  // response.status               → 'AUTHORIZED', 'FAILED', etc.
  return response;
}

module.exports = { has, crearTransaccion, confirmarTransaccion };
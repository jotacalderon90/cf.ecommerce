'use strict';

const crypto = require('node:crypto');
const axios = require('axios');

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);
const request = require('cl.jotacalderon.cf.framework/lib/request');

const FLOW_URLS = {
  production: 'https://www.flow.cl/api',
  integration: 'https://sandbox.flow.cl/api'
};

// Estados de Flow
const FLOW_STATUS = {
  1: 'PENDING',
  2: 'AUTHORIZED',
  3: 'REJECTED',
  4: 'CANCELLED'
};

// Funcion que valida si existe configuracion flow, utilizado cuando se genera la cotización
async function has(host, getFile) {
  try {
    
    const hostArchivosPrivadosProduction = 'https://' + 'archivosprivados.' + host;
    const hostArchivosPrivados = (process.env.NODE_ENV === 'production' && process.env.FRONT_MULTIDOMAIN === '1') ? hostArchivosPrivadosProduction : process.env.HOST_ARCHIVOSPRIVADOS;
    
    const respuesta = await request.get(
      hostArchivosPrivados + '/api/integration/get/L2FyY2hpdm9zcHJpdmFkb3MvY29uZmlndXJhY2lvbmVzL2Zsb3cuanNvbg==',
      {
        headers: {
          'user-agent': 'cf.ecommerce',
          'origin': 'ecommerce.' + host
        },
      }
    );
    
    console.log(respuesta.data);
    
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

// Firma HMAC SHA256: claves ordenadas, concatenadas como clave+valor
function firmar(params, secretKey) {
  const toSign = Object.keys(params)
    .sort()
    .map(key => key + params[key])
    .join('');

  return crypto
    .createHmac('sha256', secretKey)
    .update(toSign)
    .digest('hex');
}

// Retorna la configuración de Flow para el host (equivalente a getWebpay)
async function getFlow(host) {
  // Misma función "has" que usas en Webpay (config por host)
  const flowJson = await has(host, true);
  if (!flowJson) {
    logger.error(`Flow: no hay configuración para el host ${host}`);
    return null;
  }

  const isProduction = flowJson.FLOW_ENV === 'production';

  return {
    apiKey: flowJson.FLOW_API_KEY,
    secretKey: flowJson.FLOW_SECRET_KEY,
    baseUrl: isProduction ? FLOW_URLS.production : FLOW_URLS.integration
  };
}

// Extrae un error legible de las respuestas de Flow
function flowError(err) {
  const e = err.response?.data;
  return new Error(`Flow error ${e?.code ?? ''}: ${e?.message ?? err.message}`);
}

// Crear transacción
// extra: { email, subject, confirmationUrl }
async function crearTransaccion(host, buyOrder, sessionId, mount, returnUrl, extra = {}) {
  const flow = await getFlow(host);
  if (!flow) throw new Error('Flow no configurado para este host');

  const { email, subject, confirmationUrl } = extra;

  if (!Number.isInteger(mount) || mount <= 0) {
    throw new Error('Monto inválido: debe ser un entero positivo (CLP)');
  }
  if (!email || !subject || !confirmationUrl) {
    throw new Error('Flow requiere email, subject y confirmationUrl');
  }

  const params = {
    apiKey: flow.apiKey,
    commerceOrder: String(buyOrder),
    subject,
    currency: 'CLP',
    amount: mount,
    email,
    urlConfirmation: confirmationUrl,
    urlReturn: returnUrl
  };

  // Flow no tiene sessionId; se envía en "optional" y vuelve en getStatus
  if (sessionId) {
    params.optional = JSON.stringify({ sessionId });
  }

  const body = new URLSearchParams({
    ...params,
    s: firmar(params, flow.secretKey)
  });

  try {
    const { data } = await axios.post(`${flow.baseUrl}/payment/create`, body, {
      timeout: 10000
    });

    logger.info(`Flow: transacción creada orden=${buyOrder} flowOrder=${data.flowOrder}`);

    // Mismo contrato que Webpay: url + token
    return {
      url: `${data.url}?token=${data.token}`, // Flow ya trae el token en la URL de pago
      token: data.token,
      flowOrder: data.flowOrder
    };
  } catch (err) {
    logger.error(`Flow: error al crear transacción orden=${buyOrder}`, err.message);
    throw flowError(err);
  }
}

// Normaliza la respuesta de getStatus
function normalizar(data) {
  let opt = data.optional;
  if (typeof opt === 'string') { try { opt = JSON.parse(opt); } catch (_) { opt = {}; } }
  const status = FLOW_STATUS[data.status] || 'UNKNOWN';

  return {
    ...data,
    status,                              // 'AUTHORIZED' | 'PENDING' | 'REJECTED' | 'CANCELLED'
    approved: data.status === 2,
    buy_order: data.commerceOrder,       // mismos nombres que usa tu service de Webpay
    session_id: opt?.sessionId,
    amount: Number(data.amount)
  };
}

// Confirmar transacción (usar en urlConfirmation y/o al retorno del usuario)
async function confirmarTransaccion(host, token) {
  const flow = await getFlow(host);
  if (!flow) throw new Error('Flow no configurado para este host');

  const params = { apiKey: flow.apiKey, token };

  try {
    const { data } = await axios.get(`${flow.baseUrl}/payment/getStatus`, {
      params: { ...params, s: firmar(params, flow.secretKey) },
      timeout: 10000
    });

    logger.info(`Flow: estado orden=${data.commerceOrder} status=${data.status}`);

    // response.approved === true → pagada
    // response.status           → 'AUTHORIZED', 'REJECTED', 'PENDING', 'CANCELLED'
    return normalizar(data);
  } catch (err) {
    logger.error('Flow: error al confirmar transacción', err.message);
    throw flowError(err);
  }
}

// Consultar por tu número de orden (útil para reconciliar)
async function obtenerEstadoPorOrden(host, buyOrder) {
  const flow = await getFlow(host);
  if (!flow) throw new Error('Flow no configurado para este host');

  const params = { apiKey: flow.apiKey, commerceId: String(buyOrder) };

  try {
    const { data } = await axios.get(`${flow.baseUrl}/payment/getStatusByCommerceId`, {
      params: { ...params, s: firmar(params, flow.secretKey) },
      timeout: 10000
    });
    return normalizar(data);
  } catch (err) {
    logger.error(`Flow: error al consultar orden=${buyOrder}`, err.message);
    throw flowError(err);
  }
}

module.exports = { has, crearTransaccion, confirmarTransaccion, obtenerEstadoPorOrden };
'use strict';

const { z } = require('zod');


//Opciones para retorno WebPay (solo token_ws, trio de anula o 4 por timeout)
const onlyTokenWs = z.object({
  token_ws: z.string().min(1),
}).strict();
const onlyTbkFields = z.object({
  TBK_TOKEN: z.string().min(1),
  TBK_ORDEN_COMPRA: z.string().min(1),
  TBK_ID_SESION: z.string().min(1),
}).strict();
const allFourFields = z.object({
  token_ws: z.string().min(1),
  TBK_TOKEN: z.string().min(1),
  TBK_ORDEN_COMPRA: z.string().min(1),
  TBK_ID_SESION: z.string().min(1),
}).strict();

module.exports = {
  
  webpay_start: z.object({
    order: z
      .string()
      .regex(/^\d{14}$/, "Debe ser un string numérico de 14 dígitos (YYYYMMDDHHMMSS)")
  }),
  
  webpay_end: z.union([allFourFields, onlyTbkFields, onlyTokenWs]),
  
  pago_ok: z.object({
    order: z
      .string()
      .trim()
  })
};

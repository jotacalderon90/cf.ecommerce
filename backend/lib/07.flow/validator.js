'use strict';

const { z } = require('zod');

module.exports = {
  
  flow_start: z.object({
    order: z
      .string()
      .regex(/^\d{14}$/, "Debe ser un string numérico de 14 dígitos (YYYYMMDDHHMMSS)")
  }),
  
  flow_end: z.object({ 
    order: z
      .string()
      .regex(/^\d{14}$/, "Debe ser un string numérico de 14 dígitos (YYYYMMDDHHMMSS)"),
    sessionId: z
      .string()
      .min(1) ,
    token: z
      .string()
      .min(1) 
  }),
  
};

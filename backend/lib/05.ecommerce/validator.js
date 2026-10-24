'use strict';

const { z } = require('zod');

const noHtmlChars = (val) => !/[<>&"']/.test(val);
const noTextChars = (val) => !/javascript|vbscript|onerror|onload/i.test(val);

const productSchema = z.object({
  id: z.union([z.string(), z.number()]),
  cant: z.number().int().positive()
});

module.exports = {
  view: z.object({
  
  }),
  api: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .refine(
        (val) =>
          !val ||
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            val
          ),
        { message: 'El formato del email no es válido' }
      ),
    subject: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .refine(noHtmlChars, { message: 'El campo contiene caracteres no permitidos (< > & " \')' })
      .refine(noTextChars, { message: 'El campo contiene texto no permitido' })
      .optional(),
    message: z
      .string()
      .trim()
      .min(1)
      .max(5000)
      .refine(noHtmlChars, { message: 'El campo contiene caracteres no permitidos (< > & " \')' })
      .refine(noTextChars, { message: 'El campo contiene texto no permitido' })
      .optional(),
    template: z
      .string()
      .trim()
      .refine(noHtmlChars, { message: 'El campo contiene caracteres no permitidos (< > & " \')' })
      .refine(noTextChars, { message: 'El campo contiene texto no permitido' })
      .optional(),
    'g-recaptcha-response': process.env.NODE_ENV === 'production' && process.env.RECAPTCHA_PRIVATE != ''
      ? z.string()
      : z.string().optional(),
    product: z
      .array(productSchema)
      .min(1, { message: 'Debe haber al menos un producto' }),
  }),
};

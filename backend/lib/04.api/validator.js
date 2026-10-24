'use strict';

const { z } = require('zod');

module.exports = {
  total: z.object({
    category_name: z.string().trim().optional(),
  }),
  collection: z.object({
    category_name: z.string().trim().optional(),
    skip: z.coerce.number().optional(),
    sort_field: z.string().trim().toLowerCase().optional(),
    sort_type: z.coerce.number().optional(),
  }),
};

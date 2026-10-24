'use strict';

const { z } = require('zod');

module.exports = {
  category: z.object({
    category_name: z.string().trim(),
  }),
  document: z.object({
    document_url: z.string().trim(),
  }),
};

'use strict';

const { DateTime } = require('luxon');

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);

const constants = require('./constants');

const { ecommerce } = require('../_repository/_');

module.exports = {
  sitemap: async function (host) {
    let xml = '';
    try {
      
      const temp = host.split('.');
      const tempHost = temp.slice(1);
      const tempDomain = temp[0];

      const documentos = await ecommerce.collection(
        {
          host: tempHost.join('.'),
          domain: tempDomain,
        },
        {
          projection: {
            title: 1,
            uri: 1,
            tag: 1,
            created: 1,
          },
        }
      );

      const tags = [...new Set(documentos.flatMap((doc) => doc.tag))];

      xml += tags
        .map(
          (tag) => `<url><loc>https://${host}/categoria/${tag.split(' ').join('%20')}</loc></url>`
        )
        .join('');

      xml += documentos
        .map((doc) => {
          return {
            uri: doc.uri,
            created: DateTime.fromISO(doc.created, { zone: 'utc' }).toFormat('yyyy-MM-dd'),
          };
        })
        .map(
          (doc) =>
            `<url><loc>https://${host}/${doc.uri}</loc><lastmod>${doc.created}</lastmod></url>`
        )
        .join('');
    } catch (error) {
      logger.error(error);
      throw new Error(constants.error.rest.sitemap + ' ' + constants.error.servicio);
    }
    return xml;
  },
};

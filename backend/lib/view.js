'use strict';

const fs = require('fs');

const logger = require('cl.jotacalderon.cf.framework/lib/log')(__filename);

const fileCache = new Map();

module.exports = async function (view_path, host) {
  const id = view_path + host;
  let response = view_path;
  try {
    if (fileCache.has(id)) {
      return fileCache.get(id);
    }

    const view_path_host = 'assets/domains/' + host + '/' + view_path;
    const view_path_full =
      process.cwd() + '/' + (process.env.FRONTEND || 'frontend') + '/' + view_path_host + '.html';

    const exists = await fs.promises
      .access(view_path_full)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      response = view_path_host;
    }
  } catch (error) {
    logger.error(error);
  }

  fileCache.set(id, response);
  return response;
};

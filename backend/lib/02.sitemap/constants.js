'use strict';

const constants = require('../constants');

const _constants = { ...constants };

_constants.error.rest.sitemap = 'Error al generar sitemap.xml';
_constants.error.rest.sitemap_no_directory = 'No se encontró el directorio del host';

module.exports = _constants;
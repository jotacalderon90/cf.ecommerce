'use strict';

const constants = require('../constants');

const _constants = { ...constants };

_constants.error.rest.index = 'Error al generar página de inicio';
_constants.error.rest.category = 'Error al generar página de categoría';
_constants.error.rest.document = 'Error al generar página del documento';
_constants.error.rest.document_not_found = 'No se encontró el documento';

module.exports = _constants;

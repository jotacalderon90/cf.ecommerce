'use strict';

const constants = require('../constants');

const _constants = { ...constants };

_constants.error.rest.total = 'Error al obtener total';
_constants.error.rest.collection = 'Error al obtener colección';

module.exports = _constants;

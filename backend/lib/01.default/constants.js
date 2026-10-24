'use strict';

const constants = require('../constants');

const _constants = { ...constants };

_constants.error.rest.favicon = 'Error al obtener favicon';
_constants.error.rest.robots = 'Error al obtener robots';

module.exports = _constants;
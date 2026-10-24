'use strict';

const constants = require('../constants');

const _constants = {...constants};

_constants.error.rest.view = 'Error al generar vista del carro de cotización';
_constants.error.rest.api = 'Error al generar cotización';
_constants.error.rest.api_products_length = 'Hay diferencias entre la lista solicitada y la encontrada en nuestro catálogo\nfavor revise su carro de cotización';
_constants.error.rest.servicio_correo = 'Ocurrió un problema con el servicio de correo';

module.exports = _constants;

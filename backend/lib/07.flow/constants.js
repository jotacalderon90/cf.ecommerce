'use strict';

const constants = require('../constants');

const _constants = structuredClone(constants);

_constants.error.rest.flow_start = 'Error al iniciar proceso de pago con flow';
_constants.error.rest.flow_end = 'Error al finalizar proceso de pago con flow';

_constants.error.rest.flow = 'Error al procesar respuesta de flow';
_constants.error.rest.flow_timeout = 'El tiempo para completar el pago se agotó. Intenta nuevamente.';
_constants.error.rest.flow_aborted = 'El pago fue anulado por el usuario, no se generó ningún cargo.';
_constants.error.rest.flow_pending = 'El pago por flow esta pendiente';
_constants.error.rest.flow_rejected = 'El pago por flow fue rechazado';

_constants.error.rest.cart_notfound = 'No se encontró registro asociado, disculpe las molestias, informe por otro medio de esta situación';
_constants.error.rest.cart_badlength = 'Ocurrió un problema inesperado, favor notifique indicando código de error #bl';
_constants.error.rest.cart_notupdated = 'No encontramos el registro asociado para confirmar el pago, notifique de esta situación y no se preocupe que solucionaremos este inconveniente lo más pronto posible.';
_constants.error.rest.cart_notvalidmount = 'flow retorno un monto inválido a la compra realizada desde nuestro sistema';
_constants.error.rest.cart_notproccesed = 'No se pudo procesar el pago';
_constants.error.rest.cart_proccesed = 'El documento ya está marcado como procesado';

module.exports = _constants;

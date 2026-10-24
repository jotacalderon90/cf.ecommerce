'use strict';

const constants = require('../constants');

const _constants = {...constants};

_constants.error.rest.webpay_start = 'Error al iniciar proceso de pago con webpay';
_constants.error.rest.webpay_end = 'Error al finalizar proceso de pago con webpay';

_constants.error.rest.webpay = 'Error al procesar respuesta de webpay';
_constants.error.rest.webpay_timeout = 'El tiempo para completar el pago se agotó. Intenta nuevamente.';
_constants.error.rest.webpay_aborted = 'El pago fue anulado por el usuario, no se generó ningún cargo.';

_constants.error.rest.cart_notfound = 'No se encontró registro asociado, disculpe las molestias, informe por otro medio de esta situación';
_constants.error.rest.cart_badlength = 'Ocurrió un problema inesperado, favor notifique indicando código de error #bl';
_constants.error.rest.cart_notupdated = 'No encontramos el registro asociado para confirmar el pago, notifique de esta situación y no se preocupe que solucionaremos este inconveniente lo más pronto posible.';
_constants.error.rest.cart_notvalidmount = 'Webpay retorno un monto inválido a la compra realizada desde nuestro sistema';
_constants.error.rest.cart_notproccesed = 'No se pudo procesar el pago';
_constants.error.rest.cart_proccesed = 'El documento ya está marcado como procesado';

_constants.error.rest.pago_ok = 'Problemas al cargar página de pago exitoso';

module.exports = _constants;

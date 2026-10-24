'use strict';

const controlador = require('./lib/06.webpay/controller');

module.exports = {
  /**
   * @swagger
   * /api/webpay/start/{order}:
   *   get:
   *     tags:
   *       - WebPay
   *     summary: servicio para cargar flujo de webpay
   *     description: servicio para cargar flujo de webpay
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
	//@route('/api/webpay/start/:order')
	//@method(['get'])
	webpay_start: controlador.webpay_start,

  /**
   * @swagger
   * /api/webpay/end/{id}:
   *   get:
   *     tags:
   *       - WebPay
   *     summary: servicio de retorno de pago
   *     description: servicio de retorno de pago
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
  /**
   * @swagger
   * /api/webpay/end/{id}:
   *   post:
   *     tags:
   *       - WebPay
   *     summary: servicio de retorno de pago
   *     description: servicio de retorno de pago
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
	//@route('/api/webpay/end/:id')
	//@method(['get','post'])
	webpay_end: controlador.webpay_end,

  /**
   * @swagger
   * /pago/ok/{order}:
   *   get:
   *     tags:
   *       - Views
   *     summary: Pagina de pago exitoso
   *     description: Pagina de pago exitoso
   *     responses:
   *       200:
   *         description: Respuesta en HTML
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   */
  //@route('/pago/ok/:order')
  //@method(['get'])
  pago_ok: controlador.pago_ok,
  
};
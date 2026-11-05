'use strict';

const controlador = require('./lib/07.flow/controller');

module.exports = {
  /**
   * @swagger
   * /api/flow/start/{order}:
   *   get:
   *     tags:
   *       - Flow
   *     summary: servicio para cargar flujo de flow
   *     description: servicio para cargar flujo de flow
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
	//@route('/api/flow/start/:order')
	//@method(['get'])
	flow_start: controlador.flow_start,
  
  /**
   * @swagger
   * /api/flow/end/{id}:
   *   post:
   *     tags:
   *       - Flow
   *     summary: servicio de retorno de pago flow
   *     description: servicio de retorno de pago flow
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
	//@route('/api/flow/end/:id')
	//@method(['get','post'])
	flow_end: controlador.flow_end,
  
};
'use strict';

const controlador = require('./lib/05.ecommerce/controller');

module.exports = {
  /**
   * @swagger
   * /ecommerce/carro-de-solicitud:
   *   get:
   *     tags:
   *       - Ecommerce
   *     summary: Obtener carro de cotización
   *     description: Obtener carro de cotización
   *     responses:
   *       200:
   *         description: Respuesta en HTML
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   */
	//@route('/ecommerce/carro-de-solicitud')
	//@method(['get'])
	view: controlador.view,
  
	/**
   * @swagger
   * /api/ecommerce:
   *   post:
   *     tags:
   *       - Ecommerce
   *     summary: Generar cotización
   *     description: Generar cotización
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
	//@route('/api/ecommerce')
	//@method(['post'])
	api: controlador.api,
};
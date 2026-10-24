'use strict';

const controlador = require('./lib/04.api/controller');

module.exports = {
  /**
   * @swagger
   * /api/ecommerce/total:
   *   get:
   *     tags:
   *       - Api
   *     summary: Obtener total de registros
   *     description: Obtener total de registros
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
  //@route('/api/ecommerce/total')
  //@method(['get'])
  total: controlador.total,

  /**
   * @swagger
   * /api/ecommerce/collection:
   *   get:
   *     tags:
   *       - Api
   *     summary: Obtener coleccion de registros
   *     description: Obtener coleccion de registros
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
  //@route('/api/ecommerce/collection')
  //@method(['get'])
  collection: controlador.collection,
};

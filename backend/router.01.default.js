'use strict';

const controlador = require('./lib/01.default/controller');

module.exports = {
  /**
   * @swagger
   * /favicon.ico:
   *   get:
   *     tags:
   *       - Default
   *     summary: obtener favicon
   *     description: obtiene favicon
   *     responses:
   *       200:
   *         description: Icono del sitio
   *         content:
   *           image/x-icon:
   *             schema:
   *               type: string
   *               format: binary
   */
  //@route('/favicon.ico')
  //@method(['get'])
  favicon: controlador.favicon,

  /**
   * @swagger
   * /robots.txt:
   *   get:
   *     tags:
   *       - Default
   *     summary: obtener robots
   *     description: obtiene robots.txt
   *     responses:
   *       200:
   *         description: Respuesta en texto plano
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   */
  //@route('/robots.txt')
  //@method(['get'])
  robots: controlador.robots,
};

'use strict';

const controlador = require('./lib/03.views/controller');

module.exports = {
  /**
   * @swagger
   * /:
   *   get:
   *     tags:
   *       - Views
   *     summary: Obtener index del sitio
   *     description: Obtener index del sitio
   *     responses:
   *       200:
   *         description: Respuesta en HTML
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   */
  //@route('/')
  //@method(['get'])
  index: controlador.index,

  /**
   * @swagger
   * /categoria/{category_name}:
   *   get:
   *     tags:
   *       - Views
   *     summary: Obtener pagina de categoria
   *     description: Obtener pagina de categoria
   *     responses:
   *       200:
   *         description: Respuesta en HTML
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   */
  //@route('/categoria/:category_name')
  //@method(['get'])
  category: controlador.category,

  /**
   * @swagger
   * /{document_url}:
   *   get:
   *     tags:
   *       - Views
   *     summary: Obtener pagina del artículo
   *     description: Obtener pagina del artículo
   *     responses:
   *       200:
   *         description: Respuesta en HTML
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   */
  //@route('/:document_url')
  //@method(['get'])
  document: controlador.document,
};

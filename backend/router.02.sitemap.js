'use strict';

const controlador = require('./lib/02.sitemap/controller');

module.exports = {
  /**
   * @swagger
   * /sitemap.xml:
   *   get:
   *     tags:
   *       - Sitemap
   *     summary: Obtener mapa del sitio en formato XML
   *     description: Obtener mapa del sitio en formato XML
   *     responses:
   *       200:
   *         description: Sitemap XML generado exitosamente
   *         content:
   *           text/xml:
   *             schema:
   *               type: object
   */
  //@route('/sitemap.xml')
  //@method(['get'])
  sitemap: controlador.sitemap,
};

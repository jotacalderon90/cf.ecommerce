'use strict';

module.exports = {
  //recibe un host (archivospublicos.jotace.cl, www.comercialastorga.cl, etc)
  //retorna el dominio padre, jotace.cl, comercialastorga.cl
  getParentDomain: function (host) {
    return host.split(':')[0].match(/([^.]+\.[^.]+)$/)[1];
  },

  //recibe request y retorna host de cuentas (account.jotace.cl, account.comercialastogra.cl)
  getHostAccount: function (req) {
    let host = '';
    if (process.env.NODE_ENV === 'production' && process.env.FRONT_MULTIDOMAIN === '1') {
      host = req.protocol + '://' + req.headers.host.replace(/^([^.:]+)/, 'account');
    } else {
      host = process.env.HOST_ACCOUNT;
    }
    return host;
  },

  //recibe request y retorna host de archivospublicos (archivospublicos.jotace.cl, archivospublicos.comercialastogra.cl)
  getHostArchivosPublicos: function (req) {
    let host = '';
    if (process.env.NODE_ENV === 'production' && process.env.FRONT_MULTIDOMAIN === '1') {
      host = req.protocol + '://' + req.headers.host.replace(/^([^.:]+)/, 'archivospublicos');
    } else {
      host = process.env.HOST_ARCHIVOSPUBLICOS;
    }
    return host;
  },
};

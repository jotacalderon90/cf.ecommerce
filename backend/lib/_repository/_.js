'use strict';

const validMotor = ['mongo'];

if (validMotor.indexOf(process.env.DB_MOTOR) === -1) {
  console.log('Motor de BD inválido');
  process.exit(0);
}

module.exports = {
  ecommerce: require('./' + process.env.DB_MOTOR + '/ecommerce'),
  setting: require('./' + process.env.DB_MOTOR + '/setting'),
  cart: require('./' + process.env.DB_MOTOR + '/cart'),
};

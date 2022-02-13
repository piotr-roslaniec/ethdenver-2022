const aleo = require('aleo-wasm');

module.exports = {
  randomAddress: new aleo.Account().to_address(),
};

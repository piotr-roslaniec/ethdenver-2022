const aleo = require('aleo-wasm-bundler');

const randomAddress = () => new aleo.Account().to_address();

console.log({ aleo });
console.log({ Account: aleo.Account });
console.log({ to_address: aleo.Account.to_address });

module.exports = {
  randomAddress,
};

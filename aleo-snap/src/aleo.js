const aleo = require('aleo-wasm-bundler');

// const randomAddress = () => new aleo.Account().to_address();
// const randomAddress = () => "not-a-real-address";
const randomAddress = () => JSON.stringify(aleo); // returns "{}"

console.log({ aleo });
// Returns during eval step:
// 
// Object <[Object: null prototype] {}> {
//   aleo: Object <[Object: null prototype] {}> {}
// } 

module.exports = {
  randomAddress,
};

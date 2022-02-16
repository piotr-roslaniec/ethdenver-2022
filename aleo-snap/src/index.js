const { ethErrors } = require('eth-rpc-errors');

const aleoWasm = require('./aleo');

const { PROGRAM_WASM_HEX } = require('./wasm');

// kudos: https://stackoverflow.com/a/71083193
function arrayBufferFromHex(hexString) {
  return new Uint8Array(
    hexString
      .replace(/^0x/i, '')
      .match(/../g)
      .map((byte) => parseInt(byte, 16)),
  ).buffer;
}

let wasm;

const initializeWasm = async () => {
  const importObject = {
    // './aleo_wasm_bg': aleoWasm, // --target bundler
    wbg: aleoWasm,
  };

  try {
    const wasmBuffer = arrayBufferFromHex(PROGRAM_WASM_HEX);
    wasm = await WebAssembly.instantiate(wasmBuffer, importObject);
  } catch (error) {
    console.error('Failed to initialize WebAssembly module.', error);
    throw error;
  }
};

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  if (!wasm) {
    await initializeWasm();
  }

  switch (requestObject.method) {
    case 'hello':
      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Hello, ${originString}!`,
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent:
              'But you can edit the snap source code to make it do something, if you want to!',
          },
        ],
      });
    case 'aleo_get_account_address':
      return JSON.stringify({ wasm });
    // return new wasm.instance.exports.Account().to_address();
    default:
      throw ethErrors.rpc.methodNotFound({ data: { request: requestObject } });
  }
});

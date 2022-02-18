const { ethErrors } = require('eth-rpc-errors');
const aleo = require('aleo-wasm-bundler');

const { SHA3 } = require('sha3');

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
let account;
let seed;
let accountJson;
let isConfirmTx = false;
let txPayload;

const initializeWasm = async () => {
  try {
    const wasmBuffer = arrayBufferFromHex(PROGRAM_WASM_HEX);
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    wasm = await aleo.default(wasmModule);
  } catch (error) {
    console.error('Failed to initialize WebAssembly module.', error);
    throw error;
  }
};

function makeAccount(aleo_) {
  if (!account) {
    const hash = new SHA3(256);
    hash.update(seed);
    const buffer = hash.digest();
    account = aleo_.Account.from_seed(buffer);
  }
}

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  if (!wasm) {
    await initializeWasm();
  }

  switch (requestObject.method) {
    case 'aleo_get_account':
      seed = requestObject.params[0];
      if (!seed) {
        return ethErrors.rpc.invalidParams('Missing parameter: seed');
      }

      makeAccount(aleo, seed);
      accountJson = {
        address: account.to_address(),
        view_key: account.to_view_key(),
        to_private_key: account.to_private_key(), // TODO: Don't do this in production
      };
      return accountJson;

    case 'aleo_send_transaction':
      seed = requestObject.params[0];
      if (!seed) {
        return ethErrors.rpc.invalidParams('Missing parameter: seed');
      }
      txPayload = requestObject.params[1];
      if (!txPayload) {
        return ethErrors.rpc.invalidParams('Missing parameter: txPayload');
      }

      isConfirmTx = wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Confirm transaction: ${originString}`,
            description: 'Are you sure you want to send this transaction?',
            textAreaContent: JSON.stringify(txPayload, null, 2),
          },
        ],
      });

      if (!isConfirmTx) {
        return 'user rejected confirmation';
      }

      makeAccount(aleo, seed);
      return 'not implemented';
    default:
      throw ethErrors.rpc.methodNotFound({ data: { request: requestObject } });
  }
});

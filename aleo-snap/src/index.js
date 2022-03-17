const { ethErrors } = require('eth-rpc-errors');
const { getBIP44AddressKeyDeriver } = require('@metamask/key-tree');
const aleo = require('aleo-wasm-bundler');
const { SHA3 } = require('sha3');

const { rpcCall } = require('./rpc');
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

const RPC_URL = 'http://hamp.app:3032';

let wasm;
let isConfirmTx = false;
let bipEthNode;

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

function makeAccount(seed) {
  const deriveEthAddress = getBIP44AddressKeyDeriver(bipEthNode);
  const addressKey0 = deriveEthAddress(0);
  const seedWithBip44 = `${seed}${addressKey0.toString('hex')}`;

  const hash = new SHA3(256);
  hash.update(seedWithBip44);
  const buffer = hash.digest();
  const account = aleo.Account.from_seed(buffer);
  const result = {
    address: account.to_address(),
    view_key: account.to_view_key(),
  };
  console.log(`makeAccount: ${JSON.stringify(result)}`);
  return result;
}

async function sendTx(txPayload) {
  // const deriveEthAddress = getBIP44AddressKeyDeriver(bipEthNode);
  // const addressKey0 = deriveEthAddress(0);
  // const seedWithBip44 = `${seed}${addressKey0.toString('hex')}`;

  // const hash = new SHA3(256);
  // hash.update(seedWithBip44);
  // const buffer = hash.digest();
  // const account = aleo.Account.from_seed(buffer);

  const txId = await rpcCall(RPC_URL, 'sendtransaction', txPayload);
  return txId;
}

function textEllipsis(str, maxLength, { side = 'end', ellipsis = '...' } = {}) {
  if (str.length > maxLength) {
    switch (side) {
      case 'start':
        return ellipsis + str.slice(-(maxLength - ellipsis.length));
      case 'end':
      default:
        return str.slice(0, maxLength - ellipsis.length) + ellipsis;
    }
  }
  return str;
}

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  if (!wasm) {
    await initializeWasm();
  }

  switch (requestObject.method) {
    case 'aleo_get_account':
      console.log(`aleo_get_account: ${JSON.stringify(requestObject.params)}`);
      if (!requestObject.params[0]) {
        return ethErrors.rpc.invalidParams('Missing parameter: seed');
      }

      bipEthNode = await wallet.request({
        method: 'snap_getBip44Entropy_60',
      });

      return makeAccount(requestObject.params[0]);

    case 'aleo_send_transaction':
      if (!requestObject.params[0]) {
        return ethErrors.rpc.invalidParams('Missing parameter: seed');
      }

      if (!requestObject.params[1]) {
        return ethErrors.rpc.invalidParams('Missing parameter: txPayload');
      }

      isConfirmTx = await wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Confirm transaction`,
            description: 'Are you sure you want to send this transaction?',
            textAreaContent: textEllipsis(requestObject.params[1], 300),
          },
        ],
      });

      if (!isConfirmTx) {
        return null;
      }

      bipEthNode = await wallet.request({
        method: 'snap_getBip44Entropy_60',
      });

      return sendTx(requestObject.params[1]);
    default:
      throw ethErrors.rpc.methodNotFound({ data: { request: requestObject } });
  }
});

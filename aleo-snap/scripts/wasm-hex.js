const { promises: fs } = require('fs');
const path = require('path');

const WASM_PATH = path.join(__dirname, '../../aleo/wasm/pkg/aleo_wasm_bg.wasm');

main();

async function main() {
  const wasmBin = await fs.readFile(WASM_PATH);
  const wasmHex = wasmBin.toString('hex');
  const jsFileString = `
const PROGRAM_WASM_HEX = '${wasmHex}';
module.exports = { PROGRAM_WASM_HEX };
`;
  await fs.writeFile('./src/wasm.js', jsFileString);
}

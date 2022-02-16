const { promises: fs } = require('fs');
const path = require('path');

const JS_PATH = path.join(__dirname, '../../aleo/wasm/pkg/aleo_wasm.js');
const POLYFILL_PATH = path.join(__dirname, './polyfill.js');

main();

async function main() {
  const jsCode = await fs.readFile(JS_PATH);
  const polyfill = await fs.readFile(POLYFILL_PATH);
  const aleoJs = `
${polyfill};

${jsCode};
`;
  await fs.writeFile('./src/aleo.js', aleoJs);
}

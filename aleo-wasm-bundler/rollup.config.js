import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import wasmImport from 'rollup-wasm-pack-import';

import pkg from './package.json';

const input = 'index.js';
const plugins = [
    resolve(), // so Rollup can find `ms`
    commonjs(), // so Rollup can convert `ms` to an ES module
    // wasm({ sync: ['aleo_wasm_bg.wasm'] }),    // so Rollup can kiad *.wasm files
    wasmImport({
        copy: true,
        serverPath: '/',
        mapping: {
            'aleo-wasm': 'aleo_wasm_bg.wasm'
        }
    })
]

export default [
    // Browser-friendly UMD build
    {
        input,
        output: {
            name: 'aleoWasmBundler',
            file: pkg.browser,
            format: 'umd'
        },
        plugins
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input,
        external: ['ms'],
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' }
        ],
        plugins
    }
];
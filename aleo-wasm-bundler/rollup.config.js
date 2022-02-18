import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import wasm from '@rollup/plugin-wasm';

import pkg from './package.json';

export default [
    // Browser-friendly UMD build
    {
        input: 'index.js',
        output: {
            name: 'aleoWasmBundler',
            file: pkg.browser,
            format: 'umd'
        },
        plugins: [
            resolve(), // so Rollup can find `ms`
            commonjs(), // so Rollup can convert `ms` to an ES module
            wasm(),    // so Rollup can kiad *.wasm files
        ]
    },
];
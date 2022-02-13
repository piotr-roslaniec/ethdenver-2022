#!/bin/sh

# Build for both targets
wasm-pack build -t no-modules -d pkg/pkg-bundler 
# wasm-pack build -t nodejs -d pkg/pkg-node
# wasm-pack build -t browser -d pkg/pkg-browser

# Clean-up non-essential files
(cd pkg/pkg-bundler && rm package.json README.md .gitignore LICENSE.md)
# (cd pkg/pkg-node && rm package.json README.md .gitignore LICENSE.md)
# (cd pkg/pkg-browser && rm package.json README.md .gitignore LICENSE.md)

# Types are duplicated, clean them up to avoid confusion
mv pkg/pkg-node/aleo_wasm.d.ts pkg/
# rm pkg/pkg-bundler/aleo_wasm.d.ts
# rm pkg/pkg-browser/aleo_wasm.d.ts

# Copy template
cp package.template.json pkg/package.json
cp LICENSE.md README.md pkg/
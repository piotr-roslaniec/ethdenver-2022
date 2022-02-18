# Aleo Client Javascript SDK

This is a NodeJS client SDK that allows you to interact with the public rpc endpoints and private rpc endpoints of Aleo network.
The project is developed using typescript.

# Install

```bash
yarn add aleo-js-sdk
# or with npm:
npm install --save aleo-js-sdk
```

# Usage

Typescript:

```typescript
import { AleoClient, AleoAuthClient } from 'aleo-js-sdk';
//public rpc
const aleoClient = new AleoClient('http://127.0.0.1:3030/');
//private rpc
const aleoAuthClient = new AleoAuthClient(
  'http://127.0.0.1:3030/',
  'username',
  'password'
);

const transaction_id = 'xxxxxxx';
aleoClient.get_transaction_info(transaction_id).then(console.log);

aleoAuthClient.create_account().then(console.log);
```

NodeJS:

```javascript
const { AleoClient, AleoAuthClient } = require('aleo-js-sdk');
//public rpc
const aleoClient = new AleoClient('http://127.0.0.1:3030/');
//private rpc
const aleoAuthClient = new AleoAuthClient(
  'http://127.0.0.1:3030/',
  'username',
  'password'
);

const transaction_id = 'xxxxxxx';
aleoClient.get_transaction_info(transaction_id).then(console.log);

aleoAuthClient.create_account().then(console.log);
```

# API Reference

- [API Document](https://comdex.github.io/aleo-js-sdk/)
- [Aleo RPC Document](https://developer.aleo.org/testnet/getting_started/overview)

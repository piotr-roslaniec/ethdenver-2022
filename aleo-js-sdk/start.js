const { AleoClient } = require('./build/main/index');
const { fakeTxHex } = require('./tx');

const RPC_URL = 'http://hamp.app:3032';

const aleoClient = new AleoClient(RPC_URL);

const run = async () => {
    const latestBlock = await aleoClient.get_latest_block();
    console.log({ latestBlock });


    const txId = await aleoClient.send_transaction(fakeTxHex);
    console.log({ txId });
};

run();

async function rpcCall(uri, methodName, params) {
    const id = Math.round(Math.random() * 10000000);

    const response = await fetch(
        uri,
        {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Keep-Alive': 'timeout=15, max=100',
                Connection: 'Keep-Alive',
            },
            keepalive: true,
            body: JSON.stringify({
                jsonrpc: '2.0',
                id,
                method: methodName,
                params,
            }),
        },
    );
    const data = await response.json();

    if (data.id && data.id !== id) {
        throw new Error('JSONRPCError: response ID does not match request ID!');
    }

    if (data.error) {
        throw new Error(`JSONRPCError: server error ${JSON.stringify(data.error)}`);
    }
    return data.result;
}

module.exports = { rpcCall };
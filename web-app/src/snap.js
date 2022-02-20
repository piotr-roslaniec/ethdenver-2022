export async function connectSnap(snapId) {
    try {
        const result = await ethereum.request({
            method: 'wallet_enable',
            params: [{
                wallet_snap: { [snapId]: {} },
            }]
        })
        console.log({ result})
    } catch (error) {
        // The `wallet_enable` call will throw if the requested permissions are
        // rejected.
        if (error.code === 4001) {
            console.error('The user rejected the request.');
            alert('The user rejected the request.');
        } else {
            console.error(error)
            alert('Error: ' + error.message || error)
        }
    }
}

export async function getAccount(snapId, seed) {
    try {
        const account = await ethereum.request({
            method: 'wallet_invokeSnap',
            params: [snapId, {
                method: 'aleo_get_account',
                params: [seed],
            }]
        })
        console.log({ account })
        return account;
    } catch (error) {
        console.error(error)
        alert('Error: ' + error.message || error)
    }
}

export async function sendTransaction(snapId, seed, txPayload) {
    try {
        const response = await ethereum.request({
            method: 'wallet_invokeSnap',
            params: [snapId, {
                method: 'aleo_send_transaction',
                params: [seed, txPayload],
            }]
        })
        console.log({ response })
        return response;
    } catch (err) {
        console.error(err)
        alert('Error: ' + err.message || err)
    }
}
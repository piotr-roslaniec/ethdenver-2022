export const DEFAULT_SNAP_ID = 'npm:aleo-snap';

export async function connectSnap() {
    try {
        const result = await ethereum.request({
            method: 'wallet_enable',
            params: [{
                wallet_snap: { [DEFAULT_SNAP_ID]: {} },
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

export async function getAccount(seed) {
    try {
        const account = await ethereum.request({
            method: 'wallet_invokeSnap',
            params: [DEFAULT_SNAP_ID, {
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

export async function sendTransaction(seed, txPayload) {
    try {
        const response = await ethereum.request({
            method: 'wallet_invokeSnap',
            params: [DEFAULT_SNAP_ID, {
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
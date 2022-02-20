const { createWorkerFactory } = require('@shopify/web-worker');

export const findAddressContainingSubstring = async (snapId, substr, maxEpoch=10) => {
    console.log("Searching for address containing: " + substr);

    if (substr.length >= 9) {
        console.log("Warning, vanities over 9 characters are expected to take longer than 3 hours and may timeout.");
        console.log("Strongly suggest reducing the input size to below 9 chars");
    }
    const ALPHABET = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijlkmnopqrstuvwxyz'
    const INVALID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZbi'
    for (let i = 0; i < substr.length; i++) {
        if (ALPHABET.indexOf(substr[i]) < 0 || INVALID_CHARS.indexOf(substr[i]) >= 0) {
            console.log("Your search term is not valid - please ensure search term only includes bech32 valid characters: " + ALPHABET);
            console.log("These characters are invalid: " + INVALID_CHARS);
            console.error("Found this invalid char: " + substr[i]);
            return null;
        }
    }

    const createWorker = createWorkerFactory(() => import('./vanity-worker'));

    let epoch = 1
    do {
        console.log("Epoch: " + epoch);

        epoch++;
        if (epoch > maxEpoch) {
            return null;
        }

        let promises = []
        for (let i = 0; i < 4; i++) {
            const seed = `${substr}_${epoch}_${i}`;
            const worker = createWorker();
            promises.push(worker.makeAccount(snapId, seed));
        }

        const results = await Promise.all(promises);

        for (const result of results) {
            const { account, seed } = result;
            const address = account.address;
            console.log(`${seed} => ${address}`);

            const ALEO_ADDR_PREFIX = 'aleo1';
            const prefix = `${ALEO_ADDR_PREFIX}${substr}`
            if (address.startsWith(prefix)) {
                return { account, seed };
            }
        }
    } while (true);

    // Failed to find a matching address
    return null;
}


const { SHA3 } = require('sha3');

// ToDo add better support for bech32

export const findAddressContainingSubstring = (substr, aleo) => {
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

    let address = makeAccount(aleo, `${substr}_${cc}`).account.to_address();

    // ToDo Try using seeds to increase randomness
    // ToDo find the equivalents of tick() for browser

    let cc = 1
    do {
        cc++;
        if (cc > 100) {
            return null;
        }

        const { account, seed } = makeAccount(aleo, `${substr}_${cc}`);
        address = account.to_address();
        console.log(`Checked seed ${seed}: ${address}`);

        const ALEO_ADDR_PREFIX = 'aleo1';
        const prefix = `${ALEO_ADDR_PREFIX}${substr}`
        if (address.startsWith(prefix)) {
            return account;
        }
    } while (true);

    // Failed to find a matching address
    return null;
}

const makeAccount = (aleo, seed) => {
    const hash = new SHA3(256);
    hash.update(seed);
    const buffer = hash.digest();

    const account = aleo.Account.from_seed(buffer);
    return { account, seed };
}
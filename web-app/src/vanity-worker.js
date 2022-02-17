const { SHA3 } = require('sha3');

export const makeAccount = async (aleo, seed) => {
    const hash = new SHA3(256);
    hash.update(seed);
    const buffer = hash.digest();

    const account = aleo.Account.from_seed(buffer);
    return Promise.resolve({ account, seed });
}
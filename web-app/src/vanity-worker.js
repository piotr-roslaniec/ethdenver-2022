const { getAccount } = require('./snap');

export const makeAccount = async (seed) => {
    const account = await getAccount(seed)
    return Promise.resolve({ account, seed });
}
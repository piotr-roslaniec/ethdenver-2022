const { getAccount } = require('./snap');

export const makeAccount = async (snapId, seed) => {
    const account = await getAccount(snapId, seed)
    return Promise.resolve({ account, seed });
}
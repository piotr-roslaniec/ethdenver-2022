#!/usr/bin/env node

// ToDo add better support for bech32

export const findAddressContainingSubstring = (substr, aleo) => {
    console.log("Searching for address containing: " + substr);

    if (substr.length >= 9) {
        console.log("Warning, vanities over 9 characters are expected to take longer than 3 hours and may timeout.");
        console.log("Strongly suggest reducing the input size to below 9 chars");
    }
    var ALPHABET = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijlkmnopqrstuvwxyz'
    var INVALID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZbi'
    for (var i = 0; i < substr.length; i++) {
        if (ALPHABET.indexOf(substr[i]) < 0 || INVALID_CHARS.indexOf(substr[i]) >= 0) {
            console.log("Your search term is not valid - please ensure search term only includes bech32 valid characters: " + ALPHABET);
            console.log("These characters are invalid: " + INVALID_CHARS);
            console.error("Found this invalid char: " + substr[i]);
            return null;
        }
    }

    var cc = 1
    var account = new aleo.Account();
    var address = account.to_address();

    // ToDo Try using seeds to increase randomness
    // ToDo find the equivalents of tick() for browser

    while (!address.startswith(substr)) {
        account = new aleo.Account();
        address = account.to_address();
        console.log("Checked " + cc++ + " hashes");
    }

    console.log("\nFound Target Account");
    console.log("Private Key: " + account.to_private_key());
    console.log("View Key: " + account.to_view_key());
    console.log("Address: " + account.to_address());


    return account;
}


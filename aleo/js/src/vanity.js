#!/usr/bin/env node

const core = require('./core.js');

(async () => {
    if (process.argv.length <= 2) {
        console.log("Please enter a term to find, with an optional password, e.g. node vanity.js test [password]");
        return;
    }
    var match = process.argv[2];
    if (match.length >= 9) {
        console.log("Warning, over vanities 9 characters are expected to take longer than 3 hours and may timeout.");
        console.log("Strongly suggest reducing the input size to below 9 chars");

    }
    var ALPHABET = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijlkmnopqrstuvwxyz'
    // ToDo check why 'i,b' isn't valid (I tested by running the script for a while and saw no addresses that contained 'i,b')
    var INVALID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZbi'
    for (var i = 0; i < match.length; i++) {
        if (ALPHABET.indexOf(match[i]) < 0 || INVALID_CHARS.indexOf(match[i]) >= 0) {
            console.log("Found this invalid char: " + match[i]);
            console.log("Your search term is not valid - please ensure search term only includes b58 valid characters: " + ALPHABET);
            console.log("These characters are invalid: " + INVALID_CHARS);
            return;
        }
    }

    var cc = 1

    function tick() {
        var account = new core.Account();
        var address = account.address();


        if (address.includes(match)) {
            console.log("\nFound Target Account");
            console.log("Private Key: " + account.privateKey());
            console.log("View Key: " + account.viewKey());
            console.log("Address: " + account.address());

        } else {
            printProgress("Checked " + cc++ + " hashes");
            setImmediate(tick);
        }
    }

    tick();
})();

function printProgress(progress) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress);
}

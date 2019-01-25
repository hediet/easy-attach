const { debugProcessAndWait } = require("../lib");

module.exports = function() {
    debugProcessAndWait();

    // Continue debugging here, your breakpoint is one stackframe up.

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Everyone knows that debugging is twice as hard as writing
    // a program in the first place. So if you're as clever as
    // you can be when you write it, how will you ever debug it?
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    //                                         Brian Kernighan
    debugger;
};

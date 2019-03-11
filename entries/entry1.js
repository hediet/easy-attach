const { debugProcessAndWait } = require("../dist/lib");

module.exports = function(args) {
	debugProcessAndWait(args);

	// Continue debugging here, your breakpoint is one stackframe up.

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// If debugging is the process of removing software bugs,
	// then programming must be the process of putting them in.
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//                                         E. W. DIJKSTRA
	debugger;
};

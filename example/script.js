function obscureFunction(args) {
	// this require call launches the debugger and waits
	require("../")();
	anotherObscureFunction(args.data);
}

console.log("Calling obscureFunction...");

obscureFunction({ data: 5 });

function obscureFunction(args) {
	// this require call launches the debugger and waits
	require("../")({ label: "test", continue: false });
	anotherObscureFunction(args.data);
}

console.log("Calling obscureFunction...");

obscureFunction({ data: 5 });

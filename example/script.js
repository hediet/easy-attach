
function obscureFunction(args) {
    // this require call launches the debugger and waits
    require("../")();
    anotherObscureFunction(args.data);
}

obscureFunction({ data: 5 });

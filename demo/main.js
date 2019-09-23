console.log("Started");
const now = new Date();
require("..\\")({ label: "atest" });
console.log("foo");
const dayOfWeek = now.getDayOfWeek();
console.log("Day of week:", dayOfWeek);

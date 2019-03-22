const entries = [require("./entry1"), require("./entry2")];

function randomInt(min, max) {
	return min + Math.floor(Math.random() * (max + 1 - min));
}

const randomIndex = randomInt(0, entries.length - 1);

// choose a random quote.
const entry = entries[randomIndex];
module.exports = entry;

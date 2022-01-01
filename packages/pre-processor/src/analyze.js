const fs = require("fs");

const DATA_DIR = "../../data/"
const filenames = fs.readdirSync(`${DATA_DIR}places/`).filter(filename => filename.endsWith(".json"));
const fileCount = filenames.length;

let errorCount = 0;
let polygonCount = new Map();

for (let i = 0; i < fileCount; ++i) {
	process.stdout.write(`\rAnalyzing polygons ${i}/${fileCount}...`);
	const iStr = ("0000" + i.toString()).substr(-5);
	const filename = `${DATA_DIR}places2/${iStr}.json`;

	const jsonText = fs.readFileSync(filename, {encoding: "utf8"});
	if (jsonText === "") {
		errorCount += 1;
		continue;
	}

	const json = JSON.parse(jsonText);

	if (Array.isArray(json)) {
		const result = json[0];
		const geojson = result.geojson;
		const type = geojson.type;

		polygonCount.set(type, (polygonCount.get(type) ?? 0) + 1);
	} else {
		errorCount += 1;
	}
}
console.log();

console.log(`Errors: ${errorCount}`);
for (const [type, count] of polygonCount) {
	console.log(`Type "${type}": ${count}`);
}

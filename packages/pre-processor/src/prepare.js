const fs = require("fs");

const DATA_DIR = "../../data/"
const filenames = fs.readdirSync(`${DATA_DIR}places/`).filter(filename => filename.endsWith(".json"));
const fileCount = filenames.length;

const coordArray = new Float32Array(2 * fileCount);

for (let i = 0; i < fileCount; ++i) {
	process.stdout.write(`\rProcessing ${i}/${fileCount}...`);
	const iStr = ("0000" + i.toString()).substr(-5);
	const filename = `${DATA_DIR}places/${iStr}.json`;

	const json = JSON.parse(fs.readFileSync(filename));
	const result = json.results[0];

	let lat, lon;

	if (result !== undefined) {
		const location = result.geometry.location;
		lat = location.lat;
		lon = location.lng;
	} else {
		lat = Number.NaN;
		lon = Number.NaN;
	}

	coordArray[i * 2] = lat;
	coordArray[i * 2 + 1] = lon;
}
console.log();

fs.writeFileSync(`${DATA_DIR}places.bin`, coordArray);

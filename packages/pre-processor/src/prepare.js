const fs = require("fs");

const DATA_DIR = "../../data/"

const placesStr = fs.readFileSync(`${DATA_DIR}places.txt`, {encoding: "utf-8"});
const places = placesStr.split("\n").slice(0, -1);

class BinaryWriter {
	constructor() {
		this._length = 0;
		this._buffer = Buffer.allocUnsafe(4);
	}

	get subarray() { return this._buffer.subarray(0, this._length); }

	ensureCapacity(capacity) {
		if (this._buffer.length >= capacity) return;

		let newCapacity = this._buffer.length;
		while (newCapacity < capacity) newCapacity *= 2;

		const buffer = Buffer.allocUnsafe(newCapacity);
		this._buffer.copy(buffer, 0, 0, this._length);
		this._buffer = buffer;
	}

	writeU32(value) {
		this.ensureCapacity(this._length + 4);
		this._buffer.writeUInt32LE(value, this._length);
		this._length += 4;
	}

	writeF32(value) {
		this.ensureCapacity(this._length + 4);
		this._buffer.writeFloatLE(value, this._length);
		this._length += 4;
	}
}

const coordArray = new Float32Array(2 * places.length);
for (let i = 0; i < places.length; ++i) {
	process.stdout.write(`\rProcessing places ${i}/${places.length}...`);
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

const polygonData = new BinaryWriter();
for (let i = 0; i < places.length; ++i) {
	process.stdout.write(`\rProcessing polygons ${i}/${places.length}...`);
	const iStr = ("0000" + i.toString()).substr(-5);
	const filename = `${DATA_DIR}places2/${iStr}.json`;

	const jsonText = fs.readFileSync(filename, {encoding: "utf-8"});
	if (jsonText === "") {
		polygonData.writeU32(0);
		continue;
	}

	const json = JSON.parse(jsonText);
	if (!Array.isArray(json)) {
		polygonData.writeU32(0);
		continue;
	}

	const geojson = json[0].geojson;
	if (geojson === undefined) {
		polygonData.writeU32(0);
		continue;
	}

	const type = geojson.type;
	const coords = geojson.coordinates;

	const serializeLoop = (loop) => {
		polygonData.writeU32(loop.length);
		for (const coords of loop) {
			polygonData.writeF32(coords[0]);
			polygonData.writeF32(coords[1]);
		}
	};

	const serializePolygon = (polygon) => {
		polygonData.writeU32(polygon.length); // loop count
		for (const loop of polygon) {
			serializeLoop(loop);
		}
	}

	if (type === "Polygon") {
		polygonData.writeU32(1); // polygon count
		serializePolygon(coords);
	} else if (type === "MultiPolygon") {
		polygonData.writeU32(coords.length); // polygon count
		for (const poly of coords) {
			serializePolygon(poly);
		}
	} else {
		polygonData.writeU32(0);
	}
}
console.log();
fs.writeFileSync(`${DATA_DIR}places2.bin`, polygonData.subarray);

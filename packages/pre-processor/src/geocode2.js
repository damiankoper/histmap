const fs = require("fs");
const https = require("https");

const placesStr = fs.readFileSync("places.txt", {encoding: "utf-8"});
const places = placesStr.split("\n").slice(0, -1);

const API_KEY = "";

/**
 * Sleep for some time
 * @param {string} millis
 * @returns {Promise<void>}
 */
function sleep(millis) {
	return new Promise(resolve => setTimeout(resolve, millis));
}

async function main() {
	for (let i = 0; i < places.length; ++i) {
		const placeName = places[i];
		const iStr = ("0000" + i.toString()).substr(-5);
		const destFilename = `places2/${iStr}.json`;

		console.log(`${iStr} / ${places.length}`);
		if (fs.existsSync(destFilename)) {
			console.log(`    Destination file ${destFilename} exists, skipping`);
			continue;
		}

		const options = {
			host: "eu1.locationiq.com",
			path: `/v1/search.php?key=${API_KEY}&q=${encodeURIComponent(placeName)}&format=json&polygon_geojson=1&limit=1`,
		};

		console.log(`    URL: ${options.host}${options.path}`);
		console.log(`    Destination: ${destFilename}`);

		/** @type {Promise<string>} */
		const result = await new Promise(resolve => {
			https.request(options, (res) => {
				let str = "";
				res.on("data", chunk => str += chunk);
				res.on("end", () => resolve(str));
			}).end();
		});

		try {
			const json = JSON.parse(result);
			if (json.hasOwnProperty("error") && json.error !== "Unable to geocode" && json.error !== "Unknown error - Please try again after some time")
			{
				console.log(`ERROR: ${json.error}`);
				break;
			}
		}
		catch (e) {
			console.log("ERROR: Can't parse as JSON:");
			console.log(result);
		}

		fs.writeFileSync(destFilename, result);

		await sleep(1100);
	}
}

main();

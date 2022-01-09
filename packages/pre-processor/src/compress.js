const {
  createReadStream,
  createWriteStream
} = require('fs');
const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const { promisify } = require('util');

const DATA_DIR = "../../data/";
const pipe = promisify(pipeline);


console.log("Reading data.json...");
const gzip = createGzip();
const source = createReadStream(`${DATA_DIR}data.json`);
const destination = createWriteStream(`${DATA_DIR}data`);

(async () => {
  console.log("Compressing...");
  await pipe(source, gzip, destination);
  console.log("Done");
})()


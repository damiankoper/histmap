const fs = require("fs");
const lz = require("lz-string");

const DATA_DIR = "../../data/";

console.log("Reading data.json...");
const dataString = fs.readFileSync(`${DATA_DIR}data.json`, {encoding: "utf-8"});
console.log(`data.json is ${dataString.length} characters long`);
console.log("Compressing...");
const dataCompressed = lz.compressToUint8Array(dataString);
console.log("Saving compressed data...");
fs.writeFileSync(`${DATA_DIR}data`, dataCompressed);

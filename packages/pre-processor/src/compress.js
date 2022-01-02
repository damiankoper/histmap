const fs = require("fs");
const {gzip, ungzip} = require('node-gzip')

const DATA_DIR = "../../data/";

console.log("Reading data.json...");
const dataString = fs.readFileSync(`${DATA_DIR}data.json`, { encoding: "utf-8" });
console.log(`data.json is ${dataString.length} characters long`);
console.log("Compressing...");

(async () => {
    const dataCompressed = await gzip(dataString)
    console.log("Saving compressed data...");
    fs.writeFileSync(`${DATA_DIR}data`, dataCompressed);
})()


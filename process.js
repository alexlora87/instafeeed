const fs = require("fs");
const { manualValidation, joiValidation } = require("./validation");

const dataBuffer = fs.readFileSync("article.json");
const article = JSON.parse(dataBuffer);

console.log("MANUAL VALIDATION\n");

manualValidation(article);

console.log("\n*******************************************************\n");

console.log("JOI VALIDATION\n");

joiValidation(article);

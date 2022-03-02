const fs = require("fs");
const validateJSON = require("./validation");

const dataBuffer = fs.readFileSync("article.json");
const article = JSON.parse(dataBuffer);

validateJSON(article);

const fs = require("fs");
const { joiValidation } = require("./validation");
const editJsonFile = require("edit-json-file");

const dataBuffer = fs.readFileSync("article.json");
const article = JSON.parse(dataBuffer);

console.log("JOI VALIDATION\n");

const writeJSONFile = (name, data) => {
  const jsonFile = editJsonFile(`${name}.json`);
  jsonFile.append(name, data);
  jsonFile.save();
};

const validateArticle = (article) => {
  try {
    joiValidation(article);
    console.log("OK");
    writeJSONFile("db", article);
  } catch (error) {
    console.log(error.message);
    writeJSONFile("invalid", article);
  }
};

validateArticle(article);

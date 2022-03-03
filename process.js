const fs = require("fs");
const clc = require("cli-color");
const { joiValidation } = require("./validation");
const editJsonFile = require("edit-json-file");

console.log(clc.bgRed("JOI VALIDATION"));
console.log("--- ----------\n");

const writeJSONFile = (name, data) => {
  const jsonFile = editJsonFile(`${name}.json`);
  jsonFile.append(name, data);
  jsonFile.save();
};

fs.readdir("articles", function (err, files) {
  if (err) {
    onError(err);
    return;
  }
  files.forEach((file) => {
    const dataBuffer = fs.readFileSync(`articles/${file}`);
    const article = JSON.parse(dataBuffer);
    console.log(clc.yellowBright(`Validating ${file}`));

    try {
      joiValidation(article);
      console.log(clc.greenBright("Validation Passed"));
      writeJSONFile("db", article);
    } catch (error) {
      console.log(error.message);
      console.log(clc.redBright("Validation Failed"));
      writeJSONFile("invalid", article);
    }
    console.log("---------- ------\n");
  });
});

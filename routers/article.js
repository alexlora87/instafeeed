const fs = require("fs");
const express = require("express");
const router = new express.Router();
const { joiValidation } = require("../validation");
const editJsonFile = require("edit-json-file");

const dataBuffer = fs.readFileSync(`./db.json`);
const dataBase = JSON.parse(dataBuffer);
const articles = dataBase.db;

const writeJSONFile = (name, data) => {
  const jsonFile = editJsonFile(`${name}.json`);
  jsonFile.append(name, data);
  jsonFile.save();
};

router.post("/articles", async (req, res) => {
  const _article = req.body;

  try {
    joiValidation(_article);
    articles.push(_article);
    writeJSONFile("db", _article);
    res.status(201).send(_article);
  } catch (e) {
    writeJSONFile("invalid", _article);
    res.status(400).send(e);
  }
});

router.get("/articles", async (_, res) => {
  if (articles.length > 0) {
    res.send(articles);
  } else {
    res.status(404).send();
  }
});

router.get("/articles/:id", async (req, res) => {
  const _id = req.params.id;
  const article = articles.filter(({ id }) => id === _id);
  if (article.length > 0) {
    res.send(article);
  } else {
    res.status(404).send();
  }
});

module.exports = router;

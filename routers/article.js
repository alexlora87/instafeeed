const fs = require("fs");
const express = require("express");
const router = new express.Router();

const dataBuffer = fs.readFileSync(`./db.json`);
const dataBase = JSON.parse(dataBuffer);
const articles = dataBase.db;

router.get("/articles", async (_, res) => {
  res.send(articles);
});

router.get("/articles/:id", async (req, res) => {
  const _id = req.params.id;
  const article = articles.filter(({ id }) => id === _id);
  res.send(article);
});

module.exports = router;

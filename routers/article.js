const express = require("express");
const router = new express.Router();
const { joiValidation } = require("../validation");

const dbName = "instafeed";
const articleCollection = (req) => req.db.db(dbName).collection("articles");

router.post("/articles", async (req, res) => {
  const _article = req.body;

  try {
    joiValidation(_article);
    await articleCollection(req).insertOne(_article);
    res.status(201).send(_article);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.get("/articles", async (req, res) => {
  try {
    var articles = await articleCollection(req).find().toArray();
    if (articles.length > 0) {
      res.send(articles);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(400).send();
  }
});

router.get("/articles/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    var articles = await articleCollection(req).find({ id: _id }).toArray();
    if (articles.length > 0) {
      res.send(articles);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;

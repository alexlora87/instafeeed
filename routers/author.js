const express = require("express");
const router = new express.Router();
const { v4: uuidv4 } = require("uuid");

const dbName = "instafeed";

const getDB = (req) => req.db.db(dbName);
const authorCollection = (req) => getDB(req).collection("authors");
const articleCollection = (req) => getDB(req).collection("articles");

router.post("/authors", async (req, res) => {
  const _author = Object.assign({ _id: uuidv4() }, req.body);

  try {
    authorCollection(req).insertOne(_author);
    res.status(201).send(_author);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/authors", async (req, res) => {
  try {
    const authors = await authorCollection(req).find().toArray();

    if (authors.length < 1) {
      return res.status(404).send();
    }

    res.send(authors);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/authors/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const authorsCollection = authorCollection(req);
    const author = await authorsCollection.find({ _id }).toArray();

    if (author.length < 1) {
      return res.status(404).send();
    }

    res.send(author);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put("/authors/:id", async (req, res) => {
  const _id = req.params.id;
  const _values = req.body;

  try {
    const authorsCollection = authorCollection(req);
    const author = await authorsCollection.find({ _id }).toArray();

    if (author.length < 1) {
      return res.status(404).send();
    }

    authorsCollection.findOneAndUpdate({ _id }, { $set: _values });
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/authors/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const authorsCollection = authorCollection(req);
    const author = await authorsCollection.find({ _id }).toArray();

    if (author.length < 1) {
      return res.status(404).send();
    }

    const articles = author[0].articles;
    if (articles.length > 0) {
      const articlesCollection = articleCollection(req);
      author[0].articles.forEach((article) => {
        articlesCollection.deleteOne({ _id: article });
      });
    }

    authorsCollection.deleteOne({ _id });
    res.status(204).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

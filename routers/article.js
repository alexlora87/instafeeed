const express = require("express");
const router = new express.Router();
const { joiValidation } = require("../validation");
const { validate, v4: uuidv4 } = require("uuid");

const dbName = "instafeed";

const articleCollection = (req) => req.db.db(dbName).collection("articles");

const replaceOrAssignId = (article) => {
  if (!article.hasOwnProperty("id") && !article.hasOwnProperty("_id")) {
    const editedArticle = Object.assign({ _id: uuidv4() }, article);
    return editedArticle;
  } else if (article.hasOwnProperty("id") && !article.hasOwnProperty("_id")) {
    let id = article["id"];
    if (!validate(id)) {
      id = uuidv4();
    }
    delete article["id"];
    const editedArticle = Object.assign({ _id: id }, article);
    return editedArticle;
  } else {
    return article;
  }
};

const articleToEdit = (article, values) => {
  Object.keys(values).forEach((key) => {
    if (article.hasOwnProperty(key)) {
      delete article[key];
    }
  });

  return Object.assign(values, article);
};

router.post("/articles", async (req, res) => {
  const _article = replaceOrAssignId(req.body);

  try {
    joiValidation(_article);
    await articleCollection(req).insertOne(_article);
    res.status(201).send(_article);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/articles", async (req, res) => {
  try {
    const articles = await articleCollection(req).find().toArray();

    if (articles.length > 0) {
      res.send(articles);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/articles/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const articlesCollection = articleCollection(req);
    const article = await articlesCollection.find({ _id }).toArray();

    if (article.length > 0) {
      res.send(article);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put("/articles/:id", async (req, res) => {
  const _id = req.params.id;
  const _values = req.body;

  try {
    const articlesCollection = articleCollection(req);
    const article = await articlesCollection.find({ _id }).toArray();

    if (article.length > 0) {
      joiValidation(_values);
      await articlesCollection.findOneAndUpdate({ _id }, { $set: _values });
      res.status(200).send();
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch("/articles/:id", async (req, res) => {
  const _id = req.params.id;
  const _values = req.body;

  try {
    const articlesCollection = await articleCollection(req);
    const article = await articlesCollection.find({ _id }).toArray();

    if (article.length > 0) {
      const editedArticle = articleToEdit(article[0], _values);
      joiValidation(editedArticle);
      await articlesCollection.findOneAndUpdate({ _id }, { $set: _values });
      res.status(200).send();
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/articles/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const articlesCollection = articleCollection(req);
    const article = await articlesCollection.find({ _id }).toArray();

    if (article.length > 0) {
      await articlesCollection.deleteOne({ _id });
      res.status(204).send();
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

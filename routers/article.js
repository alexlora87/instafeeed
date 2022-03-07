const express = require("express");
const router = new express.Router();
const { validateArticle } = require("../validation");
const { validate, v4: uuidv4 } = require("uuid");

const dbName = "instafeed";

const getDB = (req) => req.db.db(dbName);
const articleCollection = (req) => getDB(req).collection("articles");
const authorCollection = (req) => getDB(req).collection("authors");

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

const getAuthorId = async (req, id) => {
  const authorsCollection = authorCollection(req);
  const author = await authorsCollection.find({ _id: id }).toArray();
  if (author.length > 0) {
    return author[0]._id;
  } else {
    return null;
  }
};

router.post("/articles", async (req, res) => {
  const _article = replaceOrAssignId(req.body);

  try {
    const authorId = await getAuthorId(req, _article.author);
    if (authorId == null) {
      return res.status(404).send("Author ID not found");
    }

    authorCollection(req).updateOne(
      { _id: authorId },
      { $addToSet: { articles: _article._id } }
    );

    validateArticle(_article);
    articleCollection(req).insertOne(_article);
    res.status(201).send(_article);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/articles", async (req, res) => {
  try {
    const articles = await articleCollection(req).find().toArray();

    if (articles.length < 1) {
      return res.status(404).send();
    }

    res.send(articles);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/articles/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const articlesCollection = articleCollection(req);
    const article = await articlesCollection.find({ _id }).toArray();

    if (article.length < 1) {
      return res.status(404).send();
    }

    res.send(article);
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

    if (article.length < 1) {
      return res.status(404).send();
    }

    const authorId = await getAuthorId(req, _values.author);
    if (authorId == null) {
      return res.status(404).send("Author ID not found");
    }

    validateArticle(_values);
    articlesCollection.findOneAndUpdate({ _id }, { $set: _values });
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch("/articles/:id", async (req, res) => {
  const _id = req.params.id;
  const _values = req.body;

  try {
    const articlesCollection = articleCollection(req);
    const article = await articlesCollection.find({ _id }).toArray();

    if (article.length < 1) {
      return res.status(404).send();
    }

    let authorId;
    if (_values.hasOwnProperty("author")) {
      authorId = await getAuthorId(req, _values.author);
      if (authorId == null) {
        return res.status(404).send("Author ID not found");
      }
    }

    const editedArticle = articleToEdit(article[0], _values);
    validateArticle(editedArticle);
    articlesCollection.findOneAndUpdate({ _id }, { $set: _values });
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/articles/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const articlesCollection = articleCollection(req);
    const article = await articlesCollection.find({ _id }).toArray();

    if (article.length < 1) {
      return res.status(404).send();
    }

    const authorsCollection = authorCollection(req);
    authorsCollection.updateOne(
      { _id: article[0].author },
      { $pull: { articles: article[0]._id } }
    );

    articlesCollection.deleteOne({ _id });
    res.status(204).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

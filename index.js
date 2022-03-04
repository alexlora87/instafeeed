const { MongoClient } = require("mongodb");
const express = require("express");
const articleRouter = require("./routers/article");
const mongoExpressReq = require("mongo-express-req");

// Connection data
const url = "mongodb://127.0.0.1:27017/instafeed";
const config = { useNewUrlParser: true };
// Create a new MongoClient
const client = new MongoClient(url, config);

const startExpress = () => {
  const app = express();
  const port = process.env.PORT || 8080;

  app.use(express.json());
  app.use(mongoExpressReq(url, config));
  app.use(articleRouter);
  app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  });
};

const startServer = async () => {
  try {
    // Connect the client to the server
    await client.connect();
    startExpress();
    console.log("Connected successfully to server");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

startServer();

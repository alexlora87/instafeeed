const express = require("express");
const articleRouter = require("./routers/article");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(articleRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

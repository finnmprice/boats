import express from "express";

const app = express();
const port = 42069;

app.get('/', (req, res) => {
  res.send('boats.');
});

app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});
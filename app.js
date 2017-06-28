const express = require('express');
const itemController = require('./item.controller');
const app = express();

app.listen(process.env.PORT || 4001);

app.get('/item', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let asin = req.query.asin;
  let store = req.query.store;

  itemController.get(asin, store).then((result) => res.json(result));
});
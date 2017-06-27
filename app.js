var express = require('express');
const app = express();

app.listen(process.env.PORT || 8080);

app.get('/item', (req, res) => {
  console.log(req.body)
});
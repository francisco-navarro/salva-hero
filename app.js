const express = require('express');
const itemController = require('./item.controller');
const app = express();

var server_port = process.env.port || process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 4001;
var server_ip_address = process.env.HOST || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

if(process.env.OPENSHIFT_NODEJS_IP){
  app.listen(server_port, server_ip_address, function() {
    console.log('App listening on port ' + server_port);
  });
}else{
    app.listen(server_port, function() {
    console.log('App listening on port ' + server_port);
  }); 
}


app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(itemController.status());
});

app.get('/item', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let asin = req.query.asin;
  let store = req.query.store || 'es';

  itemController.get(asin, store).then((result) => {
    console.log(`${result.asin}: ${result.price} - ${result.primePrice}`);
    res.setHeader('Content-Type', 'application/json');
    res.json(result)
  });
});

app.get('/proxies', (req, res) => {
  itemController.resetProxies();
  res.json(itemController.status());
});
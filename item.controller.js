(function(){
  const cheerio = require('cheerio');
  const rp = require('request-promise');
  const request = require('request').defaults({
    jar: true
  });
  const fakeCookie = require('./fake.cookies')();
  const itemParser = require('./item.parser');
  const proxiesController = require('./proxies.controller');
  const ProxyLists = require('proxy-lists');
  const http = require("http");
  const https = require("https");

  let lastPetition;
  let lastOk;
  let lastItem;
  let uptime = new Date();

  function get(asin, store) {
    return new Promise((resolve, reject) =>  {
      var proxy = proxiesController.nextProxy();
      var body = '';
      var chrome = 'Chrome/59.0.1' + Date.now() % 100000 / 1000;
      var options = {
        path: `https://www.amazon.${store}/gp/offer-listing/${asin}/ref=dp_olp_new_mbc?ie=UTF8&condition=new`,
        headers: {
          'Referer': 'https://www.amazon.es/s/ref=nb_sb_noss?__mk_es_ES=' + salt() + '&url=search-alias%3Daps&qid=' + Math.floor(Date.now() / 1000) + '&field-keywords=iphone' + asin,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) ' + chrome + ' Safari/537.36',
          'Pragma': 'no-cache',
          'host': 'www.amazon.es'
        },
        host: proxy.ipAddress,
        port: proxy.port,
        // jar: fakeCookie.get()
      };
      lastPetition = new Date();

      http.get(options, function (res) {
        res.setEncoding('utf8');
        if (res.statusCode === 200) {

        }
        res.on('data', data => {
          body += data;
        });
        res.on('end', () => {
          try {
            let item = itemParser.get(asin, cheerio.load(body));
            if (item.price || item.primePrice){
              lastOk = new Date();
              resolve(item);
            } else {
              getLocal(asin, store).then(resp => {
                lastOk = new Date();
                resolve(resp)
              });
            }
          } catch (err) {
            console.warn('Error on proxy '+ proxy || err);
            reject(err);
          }
        });
      }).on('error', e => {
        getLocal(asin, store)
          .then(resp => {
                resolve(resp);
          }).catch((err) => reject("Got error: " + err));
      })
    });
  }

  function getLocal(asin, store) {
    var chrome = 'Chrome/59.0.1' + Date.now() % 100000 / 1000;
    var options = {
        uri: `http://www.amazon.${store}/gp/offer-listing/${asin}/ref=dp_olp_new_mbc?ie=UTF8&condition=new`,
        headers: {
          'Referer': 'https://www.amazon.es/s/ref=nb_sb_noss?__mk_es_ES=' + salt() + '&url=search-alias%3Daps&qid=' + Math.floor(Date.now() / 1000) + '&field-keywords=iphone' + asin,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) ' + chrome + ' Safari/537.36',
          'Pragma': 'no-cache',
          'host': 'www.amazon.es'
        },
        jar: fakeCookie.get(),
        transform: function (body) {
          return cheerio.load(body);
        }
      };
    console.log('Getting from local...');
    return rp(options)
      .then(function ($) {
        let item =  itemParser.get(asin, $);
        if(item.price || item.primePrice ) console.log('... OK');
        return item;
      });
  }

  function salt() {
    var len = 10 + parseInt(Math.random() * 20) + Date.now() % 20;
    return encodeURI('iphoneÁMöOÒZNáéíóúìèàiphoneÁMöOÒZNáéíóúìèà'.split ``.sort(a => .5 - Math.random()).join ``.substr(0, len))
  }

  function status() {
    return {
      uptime,
      lastPetition,
      lastOk,
      lastItem
    };
  }
  module.exports = {
    get: get,
    status: status
  };
})();

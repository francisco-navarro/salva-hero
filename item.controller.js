const cheerio = require('cheerio');
const rp = require('request-promise');
const request = require('request').defaults({
  jar: true
});
const fakeCookie = require('./fake.cookies')();
const ProxyLists = require('proxy-lists');
const http = require("http");

let lastPetition;
let lastOk;
let lastItem;
let uptime = new Date();
let count = 0;

//SELECTORS
const LIST_TABLE_COLUMN = '#olpOfferList [role="row"] .olpPriceColumn';
const PRICE_CELL = '.olpOfferPrice';
const IS_PRIME_CELL = '.supersaver';

let gettingProxies = ProxyLists.getProxies({
  protocols: ['http']
});
let proxyList = [];

gettingProxies.on('data', function (proxies) {
  if (proxies.length) {
    proxies.map(el => {
      var options = {
        host: el.ipAddress,
        port: el.port,
        path: "https://www.amazon.es",
        headers: {
          Host: "www.amazon.es"
        }
      };
      var date1 = Date.now();
      http.get(options, function(res) {
          if(res.statusCode === 200){
            var body = '';
            res.on('data', data => {
              body += data;
            });
            res.on('end', () => {
              if(body.match('body') && body.match(/amazon/) && !body.match(/Captcha/)){
                proxyList.push(el);
                //Compruebo que este mas próximo de 15000ms
                if((Date.now() - date1)<18000){
                  console.log('>>>>>>>> proxies total '+proxyList.length)
                }
              }
            });
          }
        }).on('error', function(e) {
        //console.log("Got error: " + e.message);
      });
    });
  }
});

gettingProxies.on('error', function (error) {
  console.warn(error);
});

gettingProxies.once('end', function () {
  console.log('>>>>>>>> proxies total ' + proxyList.length);
});

function get(asin, store) {
  count = (count + 1) % proxyList.length;
  var body = '';
  var chrome = 'Chrome/59.0.1' + Date.now() % 100000 / 1000;
  var options = {
    // uri: `https://www.amazon.${store}/gp/offer-listing/${asin}/ref=dp_olp_new_mbc?ie=UTF8&condition=new`,
    path: `https://www.amazon.${store}/gp/offer-listing/${asin}/ref=dp_olp_new_mbc?ie=UTF8&condition=new`,
    // transform: function (body, res) {
    //   if (res.statusCode !== 200) {
    //     console.warn(res.statusMessage);
    //   }
    //   return cheerio.load(body);
    // },
    headers: {
      // 'Referer': 'https://www.amazon.es/s/ref=nb_sb_noss?__mk_es_ES=' + salt() + '&url=search-alias%3Daps&qid=' + Math.floor(Date.now() / 1000) + '&field-keywords=iphone' + asin,
      // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) ' + chrome + ' Safari/537.36',
      // 'Pragma': 'no-cache',
      'host': 'www.amazon.es'
    },
    host: proxyList[count].ipAddress,
    port: proxyList[count].port,
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
      return cheerio.load(body);
    });
  }).on('error', e => {
    console.log("Got error: " + e.message);
  })


  return rp(options)
    .then(parseResponse)
    .catch(function (err) {
      console.warn(err);
    });

  function parseResponse($) {
    let prices = getPrices($);
    let primePrice = null;
    let price = null;
    let prime = !!prices.find(p => p.prime);
    if (prime) {
      primePrice = Math.min.apply(null, prices.filter(p => p.prime).map(p => p.price));
    }
    if (!!prices.find(p => !p.prime)) {
      price = Math.min.apply(null, prices.filter(p => !p.prime).map(p => p.price));
    }
    if (price || primePrice) {
      lastOk = new Date();
      lastItem = {
        asin,
        price,
        primePrice
      };
    }
    return {
      asin,
      price,
      currency: 'EUR',
      prime,
      primePrice,
      formattedPrice: price + ' EUR'
    };
  }
}

function salt() {
  var len = 10 + parseInt(Math.random() * 20) + Date.now() % 20;
  return encodeURI('iphoneÁMöOÒZNáéíóúìèàiphoneÁMöOÒZNáéíóúìèà'.split ``.sort(a => .5 - Math.random()).join ``.substr(0, len))
}

function getPrices($) {
  var priceSection = $(LIST_TABLE_COLUMN);
  var prices = [];
  priceSection.map((index, element) =>
    prices.push({
      price: parsePrice($(element).find(PRICE_CELL).text()),
      prime: !!$(element).find(IS_PRIME_CELL).length
    })
  );
  return prices;
}

function parsePrice(text) {
  return +text.replace(/[^0-9]/g, '');
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
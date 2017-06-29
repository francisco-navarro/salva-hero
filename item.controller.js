const cheerio = require('cheerio'); 
const rp = require('request-promise');
const request = require('request').defaults({jar: true});
const fakeCookie = require('./fake.cookies')();

//SELECTORS
const LIST_TABLE_COLUMN = '#olpOfferList [role="row"] .olpPriceColumn';
const PRICE_CELL = '.olpOfferPrice';
const IS_PRIME_CELL = '.supersaver';

function get(asin, store){
  var chrome = 'Chrome/59.0.1' + Date.now() % 100000 / 1000;
  var options = {
    uri: `http://www.amazon.${store}/gp/offer-listing/${asin}/ref=dp_olp_new_mbc?ie=UTF8&condition=new`,
      transform: function (body) {
          return cheerio.load(body);
      },
      headers: {
        'Referer': 'https://www.amazon.es/s/ref=nb_sb_noss?__mk_es_ES=' + salt()+'&url=search-alias%3Daps&qid=' + Math.floor(Date.now()/1000) +'&field-keywords=iphone' +asin,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) '+chrome+' Safari/537.36',
        'Pragma': 'no-cache'
      },
      jar: fakeCookie.get()
  };

  return rp(options)
    .then(function ($) {
      let prices = getPrices($);
      let price = Math.min.apply(null, prices.map(p => p.price));
      let prime = !!prices.find(p => p.prime);
      let primePrice;
      if(prime){
        primePrice = Math.min.apply(null, prices.filter(p => p.prime).map(p => p.price));
      }
      if(prime && primePrice === price){
        primePrice = undefined;
      }
      return {
          asin,
          price,
          currency: 'EUR',
          prime,
          primePrice,
          formattedPrice: price +' EUR'
        };
    })
    .catch(function (err) {
      console.warn(err);
    });
}
function salt(){
  var len = 10 + parseInt(Math.random()*20)+Date.now()%20;
  return encodeURI('iphoneÁMöOÒZNáéíóúìèàiphoneÁMöOÒZNáéíóúìèà'.split``.sort(a =>.5 - Math.random()).join``.substr(0, len))
}
function getPrices($){
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
function parsePrice(text){
  return +text.replace(/[^0-9]/g,'');
}
module.exports = {
  get: get
};

const cheerio = require('cheerio'); 
const rp = require('request-promise');

//SELECTORS
const LIST_TABLE_COLUMN = '#olpOfferList [role="row"] .olpPriceColumn';
const PRICE_CELL = '.olpOfferPrice';
const IS_PRIME_CELL = '.supersaver';

function get(asin, store){
  var options = {
    uri: `http://www.amazon.${store}/gp/offer-listing/${asin}/ref=dp_olp_new_mbc?ie=UTF8&condition=new`,
      transform: function (body) {
          return cheerio.load(body);
      },
      headers: {
        'Referer': 'https://www.amazon.es/s/ref=nb_sb_noss?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&url=search-alias%3Daps&field-keywords=' +asin,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.109 Safari/537.36',
        'Pragma': 'no-cache'
      }
  };

  return rp(options)
    .then(function ($) {
      let prices = getPrices($);
      return prices;
    })
    .catch(function (err) {
      console.warn(err);
    });
}
function getPrices($){
  var priceSection = $(LIST_TABLE_COLUMN);
  var prices = [];
  priceSection.map((index, element) => {
      console.log($(element).find(PRICE_CELL).text())
      console.log(!!$(element).find(IS_PRIME_CELL).length)
      prices.push({
        price: parsePrice($(element).find(PRICE_CELL).text()),
        prime: !!$(element).find(IS_PRIME_CELL).length
      });
    }
  );
  return prices;
}
function parsePrice(text){
  return parseFloat(
    text.replace(/([0-9]+),([0-9]+)/,'$1.$2')
  );
}
module.exports = {
  get: get
};

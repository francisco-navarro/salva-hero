const cheerio = require('cheerio'); 
const rp = require('request-promise');

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
      var priceSection = $('#olpOfferList').attr('role', 'main').attr('role', 'row');
      var prices = [];
      priceSection.each((index, element) => {
        prices.push($(element).find('.olpPriceColumn .olpOfferPrice'));
      });
      return prices.map(el => el.text().trim());
    })
    .catch(function (err) {
      console.warn(err);
    });
}
module.exports = {
  get: get
};

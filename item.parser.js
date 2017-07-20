//SELECTORS
const LIST_TABLE_COLUMN = '#olpOfferList [role="row"] .olpPriceColumn';
const PRICE_CELL = '.olpOfferPrice';
const IS_PRIME_CELL = '.supersaver';

function parseResponse(asin, $) {
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

module.exports = {
  get: parseResponse
};
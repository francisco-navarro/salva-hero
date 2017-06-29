const request = require('request').defaults({jar: true});
const rp = require('request-promise');
var ToughCookie = require('tough-cookie');
var Cookie = ToughCookie.Cookie;

function init(){
  let jar = request.jar();

  function storeCookies(headers) {
    try{
      headers['set-cookie'].forEach(strCookie => {
        try{
          console.log(strCookie);
          let ck = Cookie.parse(strCookie);
          let newCk = new Cookie({
              // domain: 'www.amazon.es',
              key: ck.name,
              value: ck.value,
              secure: ck.secure || false,
              path: ck.path,
              httpOnly: ck.httpOnly || false,
              extensions: ck
          });
          jar.setCookie(newCk);
        }catch(ex){
          console.log(ex);
          return;
        }
      });
    }catch(err){
      console.error('error with cookies', err);
    }
  }

  function renewCookies(){
    rp('https://www.amazon.es', (err, res, body) => {
        jar = request.jar();
        storeCookies(res.headers);
        console.log('Cookies 🍪!!')
    }).catch(function (err) {
        console.error('Error getting cookies', err);
    });
  }
  
  renewCookies();
  setInterval(renewCookies, 120*1000);

  function get(){
    return jar;
  }

  return {
    get
  };
}

module.exports = init;
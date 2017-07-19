const ProxyLists = require('proxy-lists');
const http = require("http");

const MAX_TIMEOUT_PROXY = 8000;

const options = {
  protocols: ['http'],
  bitproxies: {
    apiKey: ''
  }
};

let proxyList = [];
let count = 0;

function pool() {
  let gettingProxies = ProxyLists.getProxies(options);
  proxyList = [];

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
        http.get(options, function (res) {
          if (res.statusCode === 200) {
            var body = '';
            res.on('data', data => {
              body += data;
            });
            res.on('end', () => {
              if (body.match('body') && body.match(/amazon/) && !body.match(/Captcha/)) {
                //Compruebo que este mas próximo de 15000ms
                if ((Date.now() - date1) < MAX_TIMEOUT_PROXY) {
                  proxyList.push(el);
                  console.log('>>>>>>>> proxies total ' + proxyList.length)
                }
              }
            });
          }
        }).on('error', function (e) {
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
}

pool();

setInterval(pool, 60*60*1000);

function nextProxy(){
    count = ((count || 0) + 1) % proxyList.length;
    return proxyList[count];
}

module.exports = {
  nextProxy
}
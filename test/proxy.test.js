const http = require("http");
const ProxyLists = require('proxy-lists');
let gettingProxies = ProxyLists.getProxies({});
let proxyList = [];

gettingProxies.on('data', function(proxies) {
  if(proxies.length){
	  proxies.map(el => {
      try {
        var options = {
          host: el.ipAddress,
          port: el.port,
          path: "http://www.amazon.es",
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
              if(body.match('body')){
                //Compruebo que este mas próximo de 15000ms
                if((Date.now() - date1)<15000){
                  proxyList.push(el);
                  console.log(el);
                  console.log('>>>>>>>> proxies total '+proxyList.length)
                }
              }
            });
          }
        }).on('error', function(e) {
            //console.log("Got error: " + e.message);
        });
      }catch(err){
        
      }
      
    });
  }
});

gettingProxies.on('error', function(error) {
	console.error(error);
});

gettingProxies.once('end', function() {
	console.log('>>>>>>>> proxies total '+proxyList.length);
});


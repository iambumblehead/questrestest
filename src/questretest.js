var http = require('http');

var questretest = (function (o) {

  o.send = function (method, opts, fn) {
    var newReq, chunksCat = '',
        newRequestType = http;

    opts.method = method;

    newReq = newRequestType.request(opts, function(newRes) {
      newRes.setEncoding('utf8');

      newRes.on('error', function(e) {
        console.log('[!!!] ' + e.message, opts.port, opts.host, opts.path);
        fn(e);
      });

      newRes.on('data', function(chunk) {
        chunksCat += chunk;
      });

      newRes.on('end', function () {
        if (newRes.statusCode !== 200) {
          console.log(' bad response code ', newRes.statusCode, newRes);
        }
        fn(null, chunksCat);
      });

      newRes.on('close', function() {
        fn(null, chunksCat);
      });
    });

    newReq.on('error', function(e) {
      console.log('[!!!] ' + e.message, opts.port, opts.host, opts.path);
      fn(e);
    });

    newReq.end();
  };

  // "Pragma" header directs akamai to return a number corresponding to its own behaviour around document
  //
  // x-cache response codes are as follows,
  //
  // TCP_HIT               The data requested was served from cache on the server disk
  // TCP_MISS              The data requested was not found in cache, and a request was sent to retrieved
  //                       the resource from the origin
  // TCP_REFRESH_HIT       The data requested is older than its TTL, and an update was successfully
  //                       retrieved from the origin. However, the object has not been modified since the last
  //                       refresh however.
  // TCP_REFRESH_MISS      The data requested is older than its TTL, and an update was successfully
  //                       retrieved from the origin. The object has changed since the last refresh, and the
  //                       cache has been updated accordingly.
  // TCP_REFRESH_FAIL_HIT  The data requested is older than its TTL, but the origin appears to be down, so
  //                       the stale content was presented.          
  // TCP_IMS_HIT           Unknown, but assumed to involve If Modified Since.
  // TCP_MEM_HIT           The data requested was served from cache in the servers memory
  // TCP_DENIED            Request was denied, mostly likely due to a rate limiting or WAF rule.
  // TCP_COOKIE_DENY       Request was denied, users cookie is not authenticated for this action.          

  o.tryorigin = function (tries_num) {
    (function next (trynum) {
      if (!trynum--) {
        return console.log('completed ' + tries_num);
      }

      o.send('GET', {
        path : '/?mcpid=116981',
        host : 'domainname.com', // origin
        port : 80,
        headers : {
          "Pragma" : "no-cache",
          "Host" : "domainname.com",          
          "Accept-Language" : "en-US,en;q=0.8",
          "Upgrade-Insecure-Requests" : "1",
          "User-Agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36",
          "Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Cache-Control" : "no-cache",
          "Cookie" : ""
          //"Pragma" : "akamai-x-cache-on, akamai-x-cache-remote-on, akamai-x-check-cacheable, akamai-x-get-cache-key, akamai-x-get-extracted-values, akamai-x-get-nonces, akamai-x-get-ssl-client-session-id, akamai-x-get-true-cache-key, akamai-x-serial-no"
        }
      }, function (err, res) {

        if (err || !/html/gi.test(res)) {
          console.log('[!!!] err: ', err);
          console.log('[!!!] res: ', res);
          throw new Error('Failed response!');
        } else {
          console.log('[...] success, ' + (trynum + 1));
          setTimeout(function () { next(trynum); }, 200);
        }
      });

    }(tries_num));
  };

  
  o.tryakamai = function (tries_num) {
    (function next (trynum) {
      if (!trynum--) {
        return console.log('completed ' + tries_num);
      }

      o.send('GET', {
        path : '/path/?mcpid=116981',
        host : 'www.domain.com',              // akamai
        port : 80,
        headers : {
          "Pragma" : "no-cache",
          "Host" : "www.domain.com",
          "Accept-Language" : "en-US,en;q=0.8",
          "Upgrade-Insecure-Requests" : "1",
          "User-Agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36",
          "Accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Cache-Control" : "no-cache",
          "Cookie" : ""
          //"Pragma" : "akamai-x-cache-on, akamai-x-cache-remote-on, akamai-x-check-cacheable, akamai-x-get-cache-key, akamai-x-get-extracted-values, akamai-x-get-nonces, akamai-x-get-ssl-client-session-id, akamai-x-get-true-cache-key, akamai-x-serial-no"
        }
      }, function (err, res) {

        if (err || !/html/gi.test(res)) {
          console.log('[!!!] err: ', err);
          console.log('[!!!] res: ', res);
          throw new Error('Failed response!');
        } else {
          console.log('[...] success, ' + (trynum + 1));
          setTimeout(function () { next(trynum); }, 200);
        }
      });

    }(tries_num));
  };

  (function tryit () {
    o.tryorigin(100);
  }());
  
}({}));

const https = require('https');

// https.get('https://www.communecter.org/api/organization/get/id/551e46daa1aa144b700041b0', (res) => {
//   console.log('statusCode:', res.statusCode);
//   console.log('headers:', res.headers);
//
//   res.on('data', (d) => {
//     process.stdout.write(d);
//   });
//
// }).on('error', (e) => {
//   console.error(e);
// });

let requestOptions = {};
requestOptions.hostname = 'www.communecter.org';
requestOptions.path = '/api/organization/get/id/551e46daa1aa144b700041b0';
requestOptions.port = null;
requestOptions.method = 'GET';
requestOptions.headers = {
  Accept: 'application/xhtml+xml,application/xml,application/json,application/ld+json',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/62.0.3202.94 Chrome/62.0.3202.94 Safari/537.36'
}

console.log(requestOptions);

//requestOptions.headers.Accept='application/xhtml+xml,application/xml,application/json,application/ld+json';
//requestOptions.headers['User-Agent']='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/62.0.3202.94 Chrome/62.0.3202.94 Safari/537.36';

const request = https.request(requestOptions, response => {
  const hasResponseFailed = response.statusCode >= 400;
  var responseBody = '';
  if (response.statusCode >= 400) {
    console.log('Requestfailed with status ' + response.statusCode);
  } else {
    /* the response stream's (an instance of Stream) current data. See:
     * https://nodejs.org/api/stream.html#stream_event_data */
    response.on('data', chunk => {
      responseBody += chunk.toString()
    });

    response.on('end', () => {
      console.log(responseBody);
    });

  }
});

/* if there's an error, then reject the Promise
 * (can be handled with Promise.prototype.catch) */
request.on('error', function(e) {
  console.log(e);
});
request.end();

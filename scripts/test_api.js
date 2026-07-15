const http = require('http');
const urls = [
  'http://127.0.0.1:3001/api/events',
  'http://127.0.0.1:3001/api/rss-ingest'
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ url, status: res.statusCode, body: data });
      });
    });
    req.on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

(async () => {
  for (const url of urls) {
    const result = await fetchUrl(url);
    console.log('URL:', result.url);
    if (result.error) {
      console.log('ERROR:', result.error);
    } else {
      console.log('STATUS:', result.status);
      console.log('BODY:', result.body);
    }
    console.log('---');
  }
})();

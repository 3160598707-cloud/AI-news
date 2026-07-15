const http = require('http');
const url = 'http://127.0.0.1:3001/api/rss-ingest';

http.get(url, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log('INGEST RESULT:', data);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('ERROR:', err.message);
  process.exit(2);
});

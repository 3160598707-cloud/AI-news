const http = require('http');
const url = 'http://127.0.0.1:3001/api/daily-report';

console.log('TESTING', url);

const req = http.get(url, (res) => {
  console.log('STATUS', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('BODY', data.slice(0, 1500));
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('ERROR', err.message);
  process.exit(1);
});

req.setTimeout(60000, () => {
  console.error('TIMEOUT');
  req.abort();
  process.exit(2);
});

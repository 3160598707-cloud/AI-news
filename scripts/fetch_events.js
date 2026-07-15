const http = require('http');
const url = process.argv[2] || 'http://127.0.0.1:3001/api/events';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(data);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('ERROR:', err.message);
  process.exit(2);
});

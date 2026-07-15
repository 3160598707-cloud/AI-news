const http = require('http');

const postData = JSON.stringify({
  city: '测试市',
  country: '测试国',
  lat: 1.234,
  lng: 5.678,
  category: '测试',
  title: '自动化添加的测试事件',
  summary: '这是由自动化脚本添加的事件。',
  color: '#00ff00'
});

const options = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/api/events',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log(data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('problem with request:', e.message);
  process.exit(2);
});

req.write(postData);
req.end();

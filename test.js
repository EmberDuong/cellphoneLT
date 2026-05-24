const http = require('http');

const data = JSON.stringify({
  messages: [{ role: 'user', content: 'Xin chao, ban co ban dien thoai Samsung khong?' }]
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/chat/customer',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();

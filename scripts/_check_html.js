const fs = require('fs');
const html = fs.readFileSync('c:/Users/LENOVO/Desktop/新建文件夹/AI-news/out/index.html', 'utf8');
const idx = html.lastIndexOf('</body>');
console.log('length:', html.length);
console.log('</body> at:', idx);
console.log('before </body>:', html.substring(Math.max(0, idx - 300), idx));
console.log('---');
console.log('has inline script:', html.includes('var o=window'));
console.log('has api-proxy:', html.includes('api-proxy'));

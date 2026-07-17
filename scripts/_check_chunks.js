const fs = require('fs');
const path = require('path');
const chunksDir = 'c:/Users/LENOVO/Desktop/新建文件夹/AI-news/out/_next/static/chunks';
const files = fs.readdirSync(chunksDir);
files.forEach((f) => {
  if (f.endsWith('.js')) {
    const c = fs.readFileSync(path.join(chunksDir, f), 'utf8');
    if (c.includes('events.json')) {
      const i = c.indexOf('events.json');
      console.log('FOUND in:', f);
      console.log('Context:', c.substring(Math.max(0, i - 80), i + 80));
    }
    // Also check for old pattern
    if (c.includes("fetch('/api/") || c.includes('fetch("/api/')) {
      console.log('OLD PATTERN in:', f);
    }
  }
});
console.log('Done checking', files.length, 'files');

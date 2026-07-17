const e = require('../data/events.json');
const ts = e.map(x => x.timestamp).sort().reverse();
console.log('最新:', ts[0]);
console.log('最旧:', ts[ts.length - 1]);
console.log('总数:', e.length);
// 去重国家
const countries = [...new Set(e.map(x => x.country))].sort();
console.log('覆盖国家:', countries.join(', '));

const fs = require('fs');
const path = require('path');

const yml = `name: 📰 新闻自动抓取

on:
  schedule:
    - cron: '0 */3 * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  news:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: RSS抓取
        run: node scripts/simple_ingest.js
      - name: 生成API
        run: node scripts/gen_static_api.js
      - name: 提交
        run: |
          git config user.name bot
          git config user.email bot@ai.local
          git add data/events.json public/api/ -f
          git diff --cached --quiet || (git commit -m "新闻更新 [skip ci]" && git push)
`;

fs.writeFileSync(path.join(__dirname, '..', '.github', 'workflows', 'daily-ingest.yml'), yml);
console.log('done');

// 生成 VAPID 密钥对 (Web Push 必需)
// 运行: node scripts/gen_vapid.js
const webpush = require('web-push');

const keys = webpush.generateVAPIDKeys();
console.log('=== VAPID 密钥 ===');
console.log('Public Key:');
console.log(keys.publicKey);
console.log('Private Key:');
console.log(keys.privateKey);
console.log('\n请将这两个密钥添加为 GitHub Secrets:');
console.log('  VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('  VAPID_PRIVATE_KEY=' + keys.privateKey);

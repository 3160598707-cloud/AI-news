// AI World Monitor — SW v2 (Safari 16.4+ compatible)
const CACHE='ai-monitor-v2'
self.addEventListener('install',()=>{self.skipWaiting()})
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())})
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))})
self.addEventListener('push',e=>{const d=e.data?e.data.json():{title:'AI World Monitor',body:'全球热点已更新'};e.waitUntil(self.registration.showNotification(d.title||'🌍 今日全球 AI 情报日报',{body:d.body||'今日全球热点已更新，点击查看完整分析。',icon:'/icon-192.svg',badge:'/icon-192.svg',tag:'daily-report',renotify:true,data:{url:d.url||'/daily'},actions:[{action:'open',title:'查看日报'}]}))})
self.addEventListener('notificationclick',e=>{e.notification.close();const u=e.notification.data?.url||'/daily';e.waitUntil(self.clients.matchAll({type:'window'}).then(cs=>{for(const c of cs){if(c.url.includes(u)&&'focus' in c){c.focus();return}}if(self.clients.openWindow)self.clients.openWindow(u)}))})

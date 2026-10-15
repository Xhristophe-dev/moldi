/* Moldi - service worker: abre offline. Troque o V a cada atualização dos arquivos. */
const V='moldi-v12',SHELL=['./','index.html','style.css','app.js','manifest.webmanifest','img/icon-192.png','img/hero-lua.webp','img/estudando.webp','img/pomodoro.webp','img/quiz.webp','img/estudar.webp','img/aprender.webp','img/exercicio.webp','img/dormindo.webp','img/logo.webp','privacidade.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
/* Rede primeiro, sempre revalidando (ignora o cache do navegador, então um app.js novo aparece logo); sem internet, usa o que está guardado */
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):Response.error()))))});
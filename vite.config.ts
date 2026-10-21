import { defineConfig } from 'vite';
import {readdirSync,writeFileSync} from 'node:fs';
export default defineConfig({ base: './', build: { target: 'es2022' },plugins:[{name:'offline-practice',closeBundle(){
 const assets=['./','./index.html',...readdirSync('dist/assets').map(name=>`./assets/${name}`)];
 const version=`calculus-racers-${Date.now()}`;
 writeFileSync('dist/sw.js',`const CACHE=${JSON.stringify(version)};const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('calculus-racers-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).catch(()=>caches.open(CACHE).then(cache=>cache.match(event.request,{ignoreVary:true})).then(cached=>cached||Promise.reject(new Error('Not cached')))));});`);
 }}] });

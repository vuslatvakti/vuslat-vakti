(()=>{
document.addEventListener('DOMContentLoaded',()=>{
 const box=document.querySelector('.player-frame');if(!box)return;
 const frame=box.querySelector('iframe'),frameUrl=frame?.getAttribute('src'),preview=!frame;
 const config=window.VUSLAT_RADIO_CONFIG||{};let mode='unknown',busy=false,disposed=false;
 const style=document.createElement('style');style.textContent=`.player-frame.vv-offline{height:auto!important;aspect-ratio:auto}.vv-wait{position:relative;min-height:390px;padding:60px 24px;display:grid;place-content:center;text-align:center;color:#fff;overflow:hidden;background:#112635}.vv-wait[hidden]{display:none}.vv-wait video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.28;pointer-events:none}.vv-wait-content{position:relative;z-index:1}.vv-wait small{letter-spacing:3px}.vv-wait h3{font:italic 44px/1.15 Georgia,serif;margin:22px 0}.vv-wait p{max-width:530px;margin:16px auto}.vv-wait button{padding:12px 22px;border:1px solid #ffffff70;border-radius:26px;background:#ffffff1a;color:white;font:inherit;cursor:pointer}.vv-wait-note{font-size:12px;color:#dce5eb}`;document.head.append(style);
 const card=document.createElement('section');card.className='vv-wait';card.hidden=true;
 card.innerHTML='<div class="vv-wait-content"><small>VUSLAT VAKTİ</small><h3>Şimdi kısa bir müzik molası…</h3><p>Şu an canlı yayınımız yok. Güzel şarkılarda, aynı dostlukta yeniden buluşacağız.</p><button type="button">Bekleme müziğini dinle</button><p class="vv-wait-note" role="status">Yayın başladığında bu alan otomatik açılacak.</p></div>';
 const video=document.createElement('video');video.src=window.VUSLAT_CURRENT_THEME?.video||'';video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-hidden','true');card.prepend(video);box.append(card);
 const tracks=(Array.isArray(config.playlist)&&config.playlist.length?config.playlist:[config.jingleUrl||'vuslat-cingil.mp3']).filter(x=>typeof x==='string'&&x.trim());
 const audio=document.createElement('audio');audio.loop=false;audio.preload='none';card.append(audio);
 const b=card.querySelector('button'),note=card.querySelector('.vv-wait-note');
 let index=0,userStopped=false,attempt=0,pending=false;const failed=new Set();
 function stop(){attempt++;pending=false;audio.pause();try{audio.currentTime=0}catch{}b.textContent='Bekleme müziğini dinle'}
 async function play(){
  if(mode!=='offline'||disposed||userStopped||pending||!tracks.length)return;
  const ticket=++attempt;pending=true;
  if(audio.getAttribute('src')!==tracks[index])audio.src=tracks[index];
  try{await audio.play();if(ticket!==attempt||mode!=='offline'||disposed||userStopped){audio.pause();return}b.textContent='Müziği durdur';note.textContent='Parça '+(index+1)+' / '+tracks.length+' • Canlı yayın gelince müzik duracak.'}
  catch(e){if(ticket!==attempt)return;if(e.name==='NotAllowedError'){note.textContent='Sesi başlatmak için Dinle düğmesine bir kez bas.';b.textContent='Bekleme müziğini dinle'}else if(e.name!=='AbortError'){note.textContent='Bu parça oynatılamıyor. Dosyayı kontrol et veya tekrar dene.'}}
  finally{if(ticket===attempt)pending=false}
 }
 b.textContent='Bekleme müziğini dinle';
 b.onclick=()=>{if(mode!=='offline'||disposed)return;if(!audio.paused||pending){userStopped=true;stop();note.textContent='Müzik durduruldu.'}else{userStopped=false;failed.clear();play()}};
 audio.addEventListener('ended',()=>{if(mode!=='offline'||disposed||userStopped)return;failed.clear();index=(index+1)%tracks.length;play()});
 audio.addEventListener('error',()=>{
  if(mode!=='offline'||disposed||userStopped)return;failed.add(index);stop();
  if(failed.size>=tracks.length){note.textContent='Listedeki parçalar açılamadı. Dosya adlarını kontrol et.';return}
  do{index=(index+1)%tracks.length}while(failed.has(index));play();
 });
 function apply(next){
  const offline=next==='offline';mode=next;
  // Cıngılı iframe yeniden yüklenmeden önce durdur.
  if(!offline){stop();video.pause()}
  card.hidden=!offline;box.classList.toggle('vv-offline',offline);
  if(frame){frame.hidden=offline;if(offline){if(frame.hasAttribute('src'))frame.removeAttribute('src')}else if(!frame.hasAttribute('src'))frame.src=frameUrl}
  else{const img=box.querySelector('#radio-preview');if(img)img.hidden=offline}
  if(offline&&!preview&&!userStopped){play()}
  if(offline&&!matchMedia('(prefers-reduced-motion: reduce)').matches)video.play().catch(()=>{});
 }
 const demo=new URLSearchParams(location.search).get('bekleme');
 if(preview){apply(demo==='1'?'offline':'unknown');return}
 let endpoint;try{endpoint=new URL(config.statusUrl);if(endpoint.protocol!=='https:')throw Error()}catch{apply('unknown');return}
 const interval=Math.max(15000,Number(config.pollMs)||30000);
 async function check(){if(busy||disposed)return;busy=true;try{
  const res=await fetch(endpoint.href,{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(10000)});
  if(!res.ok)throw Error();const data=await res.json();if(!data||![0,1,'0','1'].includes(data.is_live))throw Error();
  if(!disposed){const next=Number(data.is_live)===1?'live':'offline';if(next!==mode)apply(next)}
 }catch{if(!disposed)apply('unknown')}finally{busy=false}}
 check();const timer=setInterval(check,interval);
 window.addEventListener('pagehide',()=>{disposed=true;clearInterval(timer);stop();video.pause()});
 window.addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
});})();

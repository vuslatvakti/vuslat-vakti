(()=>{
 const themes=window.VUSLAT_THEMES,params=new URLSearchParams(location.search);
 // --- Görünüm modu: URL ?mod= önce, sonra localStorage, yoksa sinematik ---
 let mod=params.get('mod');
 if(mod!=='klasik'&&mod!=='sinematik'){try{mod=localStorage.getItem('vuslat-gorunum-modu')}catch{}}
 if(mod!=='klasik'&&mod!=='sinematik')mod='sinematik';
 window.VUSLAT_VIDEO_MODU=mod;
 // --- Tema sırası: URL ?tema= (geçici görünüm) > localStorage'daki dinleyici tercihi > paket varsayılanı ---
 function temaSec(){
  let kisi=params.get('tema');
  if(!kisi){try{kisi=localStorage.getItem('vuslat-tema-secimi')}catch{}}
  return themes.find(x=>x.id===kisi)||themes.find(x=>x.id===window.VUSLAT_ACTIVE_THEME)||themes[0];
 }
 let t=temaSec();
 window.VUSLAT_CURRENT_THEME=t;
 window.VUSLAT_VIDEO_AKTIF=(window.VUSLAT_VIDEO_MODU==='sinematik')&&!!t.video;

 // ---------- STİL ----------
 function stilYaz(tr){
  let s=document.getElementById('vuslat-active-theme-style');
  if(!s){s=document.createElement('style');s.id='vuslat-active-theme-style';document.head.append(s);}
  const cursorSvg=`data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M3 2l7 23 4-9 10-3z' fill='${tr.base}' stroke='${tr.accent}' stroke-width='1.6'/><path d='M24 17l2 4 4 1-4 2-2 5-2-5-4-2 4-1z' fill='${tr.accent}' stroke='${tr.base}' stroke-width='0.8'/></svg>`)}`;
  s.textContent=`
:root{--paper:${tr.base};--blue:${tr.accent};--hl:${tr.hl||tr.accent};--ink:${tr.ink||'#fff9ef'};--muted:#eef1f3;--line:${tr.line||(tr.accent+'44')}}
html,body{height:100%;min-height:0;margin:0;overflow:hidden!important;background:${tr.base}}
body{background:transparent!important;isolation:isolate}
body:before{display:none!important}
#site-content{position:relative;z-index:1;background:transparent;height:100vh;height:100dvh;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:contain;scroll-behavior:smooth;scroll-padding-top:24px;-webkit-overflow-scrolling:touch}
#tema-fotograf,#tema-video,#tema-golge{position:fixed;inset:0;width:100%;height:100%;pointer-events:none}
#tema-fotograf{z-index:-3;background:url("${tr.bg}") 20% center/cover no-repeat}
#tema-video{z-index:-2;object-fit:cover;object-position:20% center;opacity:1}
#tema-golge{z-index:-1;background:linear-gradient(90deg,${tr.base}66,${tr.base}18)}
.player,.community,.dj-card{background:${tr.base}80!important;border-color:${tr.accent}44;backdrop-filter:blur(3px)}
.button{background:${tr.accent};color:${tr.base}}
.button:hover{background:${tr.hl||tr.accent};color:${tr.base}}
.welcome,footer,.schedule{background:${tr.base}55!important}
.player-frame{background:${tr.base}}
.player-top small,.player-help,.community p,.community li{color:#eef1f3}
.mark,.avatar,.decoration-controls button{background:${tr.base};color:${tr.accent};border-color:${tr.accent}55}
h1,header,.intro{text-shadow:0 2px 12px #07152388}
.floating-heart,.cursor-spark,.shooting-star:after{color:${tr.accent}!important}
.shooting-star{background:linear-gradient(90deg,transparent,${tr.accent})!important}
@media(pointer:fine){body.fancy-cursor,body.fancy-cursor a,body.fancy-cursor button{cursor:url("${cursorSvg}") 3 2,auto}}
#tema-video-dugme{position:fixed;right:14px;bottom:14px;z-index:100;background:${tr.base}ed;color:white;border:1px solid ${tr.accent}88;border-radius:22px;padding:10px 14px;cursor:pointer}
@media(max-width:640px){
 #tema-fotograf{background-position:28% center!important}
 #tema-video{object-position:28% center!important}
}
@media(prefers-reduced-motion:reduce){#site-content{scroll-behavior:auto}}
`;
 }

 // ---------- KATMAN TEMİZLİĞİ ----------
 function temizleKatmanlar(){
  ['tema-video','tema-fotograf','tema-golge','tema-video-dugme'].forEach(id=>{
   const el=document.getElementById(id);
   if(el){
    if(el.tagName==='VIDEO'){try{el.pause();el.removeAttribute('src');el.load()}catch{}}
    el.remove();
   }
  });
  if(typeof window.stopThemeAnimations==='function')window.stopThemeAnimations();
 }

 // ---------- KATMAN KURULUMU ----------
 function katmanlar(tr){
  temizleKatmanlar(); // çift arka plan oluşmasın
  const photo=document.createElement('div');photo.id='tema-fotograf';photo.setAttribute('aria-hidden','true');
  const shade=document.createElement('div');shade.id='tema-golge';shade.setAttribute('aria-hidden','true');
  const m=matchMedia('(prefers-reduced-motion: reduce)');
  const veriKoru=(()=>{try{const c=navigator.connection;return !!c&&(c.saveData||/^(slow-)?2g$/.test(c.effectiveType))}catch{return false}})();
  if(window.VUSLAT_VIDEO_AKTIF&&!m.matches&&!veriKoru){
   const v=document.createElement('video');v.id='tema-video';v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');v.preload='metadata';v.src=tr.video;
   const b=document.createElement('button');b.id='tema-video-dugme';b.type='button';b.textContent='Hareketi oynat';
   function label(){b.textContent=v.paused?'Hareketi oynat':'Hareketi durdur'}
   b.onclick=()=>{if(v.paused){v.hidden=false;v.play().catch(label)}else v.pause()};v.addEventListener('play',label);v.addEventListener('pause',label);
   // Video oynatmaya başladığında JPG gizlenir; hata olursa JPG geri gelir
   v.addEventListener('playing',()=>{photo.style.visibility='hidden'});
   v.addEventListener('error',()=>{if(!v.isConnected)return;v.remove();b.remove();photo.style.visibility=''});
   if(!m.matches)v.play().catch(label);else v.hidden=true;
   m.addEventListener('change',()=>{if(m.matches){v.pause();v.hidden=true;photo.style.visibility=''}});
   document.body.prepend(photo,v);document.body.append(b);
  }else{
   document.body.prepend(photo,shade);
  }
  const p=document.getElementById('radio-preview');if(p){p.src=tr.radio;p.parentElement.style.height='auto';p.parentElement.style.aspectRatio='12/7'}
  // Canvas tema animasyonu yalnızca video OYNATILIYOR DEĞİLSE (aynı efekti ikinci kez uygulamamak için)
  if(typeof window.startThemeAnimations==='function'&&!window.VUSLAT_VIDEO_AKTIF)window.startThemeAnimations(tr.id);
 }

 // ---------- DİNAMİK TEMA UYGULAMA (sayfa yenilemeden) ----------
 window.vuslatTemaUygula=function(temaId,optionlar){
  optionlar=optionlar||{};
  if(optionlar.mod==='klasik'||optionlar.mod==='sinematik'){
   window.VUSLAT_VIDEO_MODU=optionlar.mod;
   try{localStorage.setItem('vuslat-gorunum-modu',optionlar.mod)}catch{}
  }
  t=themes.find(x=>x.id===temaId)||t;
  window.VUSLAT_CURRENT_THEME=t;
  window.VUSLAT_VIDEO_AKTIF=(window.VUSLAT_VIDEO_MODU==='sinematik')&&!!t.video;
  temizleKatmanlar();
  stilYaz(t);
  const hazir=document.readyState==='loading';
  if(hazir)document.addEventListener('DOMContentLoaded',()=>katmanlar(t),{once:true});
  else katmanlar(t);
  try{
   window.dispatchEvent(new CustomEvent('vuslat-tema-degisti',{detail:{tema:t.id,videoAktif:window.VUSLAT_VIDEO_AKTIF}}));
  }catch{}
  return t.id;
 };

 // ---------- İLK UYGULAMA ----------
 stilYaz(t);
 document.addEventListener('DOMContentLoaded',()=>{katmanlar(t)});
 window.addEventListener('pagehide',temizleKatmanlar); // gidişte tüm tema kaynakları serbest
})();
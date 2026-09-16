(()=>{
const themes=window.VUSLAT_THEMES,id=new URLSearchParams(location.search).get('tema');const t=themes.find(t=>t.id===id)||themes.find(t=>t.id===window.VUSLAT_ACTIVE_THEME)||themes[0];
window.VUSLAT_CURRENT_THEME=t;const s=document.createElement('style');s.textContent=`
:root{--paper:${t.base};--blue:${t.accent};--ink:#fff9ef;--muted:#eef1f3;--line:${t.accent}44}html{background:${t.base}}body{background:transparent!important;isolation:isolate}body:before{display:none!important}#site-content{position:relative;z-index:1;background:transparent}
#tema-fotograf,#tema-video,#tema-golge{position:fixed;inset:0;width:100%;height:100%;pointer-events:none}#tema-fotograf{z-index:-3;background:url("${t.bg}") center/cover no-repeat}#tema-video{z-index:-2;object-fit:cover;object-position:center;opacity:.58;-webkit-mask-image:linear-gradient(transparent 5%,#0003 35%,#0009 60%,#000 85%);mask-image:linear-gradient(transparent 5%,#0003 35%,#0009 60%,#000 85%)}#tema-golge{z-index:-1;background:linear-gradient(90deg,${t.base}66,${t.base}18)}
.player,.community,.dj-card{background:${t.base}80!important;border-color:${t.accent}44;backdrop-filter:blur(3px)}.button,.button:hover{background:${t.accent};color:${t.base}}.welcome,footer,.schedule{background:${t.base}55!important}.player-frame{background:${t.base}}.player-top small,.player-help,.community p,.community li{color:#eef1f3}.mark,.avatar,.decoration-controls button{background:${t.base};color:${t.accent}}h1,header,.intro{text-shadow:0 2px 12px #07152388}#tema-video-dugme{position:fixed;right:14px;bottom:14px;z-index:100;background:${t.base}ed;color:white;border:1px solid ${t.accent}88;border-radius:22px;padding:10px 14px;cursor:pointer}
@media(max-width:640px){#tema-fotograf{background-position:28% center}#tema-video{object-position:28% center}}
`;document.head.append(s);
document.addEventListener('DOMContentLoaded',()=>{
 const photo=document.createElement('div');photo.id='tema-fotograf';photo.setAttribute('aria-hidden','true');
 const v=document.createElement('video');v.id='tema-video';v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');v.preload='metadata';v.src=t.video;
 const shade=document.createElement('div');shade.id='tema-golge';shade.setAttribute('aria-hidden','true');document.body.prepend(photo,v,shade);
 const b=document.createElement('button');b.id='tema-video-dugme';b.type='button';b.textContent='Hareketi oynat';document.body.append(b);
 const m=matchMedia('(prefers-reduced-motion: reduce)');function label(){b.textContent=v.paused?'Hareketi oynat':'Hareketi durdur'}
 b.onclick=()=>{if(v.paused){v.hidden=false;v.play().catch(label)}else v.pause()};v.addEventListener('play',label);v.addEventListener('pause',label);v.addEventListener('error',()=>{v.hidden=true;b.hidden=true});
 if(!m.matches)v.play().catch(label);else v.hidden=true;
 m.addEventListener('change',()=>{if(m.matches){v.pause();v.hidden=true}});
 const p=document.getElementById('radio-preview');if(p){p.src=t.radio;p.parentElement.style.height='auto';p.parentElement.style.aspectRatio='12/7'}
});})();

(()=>{
const style=document.createElement('style');style.textContent=`
html,body{height:100%;min-height:0;margin:0;overflow:hidden!important}
#site-content{height:100vh;height:100dvh;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:contain;scroll-behavior:smooth;scroll-padding-top:24px;-webkit-overflow-scrolling:touch}
#tema-fotograf,#tema-video,#tema-golge{position:fixed!important;inset:0!important;width:100%!important;height:100%!important}
#tema-fotograf{background-position:20% center!important;background-size:cover!important;background-repeat:no-repeat!important}
#tema-video{object-position:20% center!important;opacity:.44!important}
@media(prefers-reduced-motion:reduce){#site-content{scroll-behavior:auto}}
`;document.head.append(style);
})();

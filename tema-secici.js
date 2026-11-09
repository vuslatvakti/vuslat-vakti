// VUSLAT FM — Dinleyicinin kendi ekranı için tema seçim paneli
// Yalnızca localStorage ile çalışır; hiçbir sunucuya/temaya yazmaz.
// Radyo (FlatcastX iframe) ve sohbet DOM'una dokunmaz: tema değişimi
// window.vuslatTemaUygula() ile sayfa yenilemeden uygulanır.
(()=>{
 if(window.__vuTemaSecici) return; // çift yükleme koruması
 window.__vuTemaSecici=true;
 const ANAHTAR='vuslat-tema-secimi';
 function key(){try{return localStorage.getItem(ANAHTAR)}catch{return null}}
 function kaydet(id){try{localStorage.setItem(ANAHTAR,id)}catch{}}

 const css=document.createElement('style');
 css.id='vuslat-tema-secici-stil';
 css.textContent=`
#tema-sec-dugme{position:fixed;left:16px;bottom:16px;z-index:120;background:var(--paper);color:var(--ink);border:1px solid var(--line);border-radius:30px;padding:11px 18px;cursor:pointer;font-weight:650;box-shadow:0 6px 24px #0009}
#tema-sec-dugme:hover{background:var(--paper);color:var(--blue)}
#tema-sec-paneli{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:#000a;backdrop-filter:blur(2px)}
#tema-sec-paneli[hidden]{display:none!important}
.vsec-kart{background:var(--paper);color:var(--ink);border:1px solid var(--line);border-radius:20px;max-width:min(860px,92vw);max-height:min(640px,88vh);display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 60px #000d}
.vsec-bas{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--line)}
.vsec-bas strong{font-size:17px;flex:1}
.vsec-bas button{border:1px solid var(--line);background:transparent;color:var(--ink);border-radius:22px;padding:8px 13px;cursor:pointer;font:inherit}
.vsec-bas button.aktif{background:var(--blue);color:var(--paper)}
.vsec-bas button:hover{color:var(--blue)}
.vsec-bas button.aktif:hover{color:var(--paper)}
.vsec-izg{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px 18px 20px;overflow:auto}
.vsec-kartlik{background:transparent;border:2px solid transparent;border-radius:14px;padding:0;cursor:pointer;text-align:left;overflow:hidden}
.vsec-kartlik img{display:block;width:100%;height:92px;object-fit:cover}
.vsec-kartlik span{display:block;padding:8px 10px;font-size:13px;color:var(--ink)}
.vsec-kartlik.aktif{border-color:var(--blue)}
.vsec-kartlik:focus-visible{outline:3px solid var(--blue);outline-offset:2px}
@media(max-width:640px){
 #tema-sec-dugme{left:12px;bottom:12px;padding:10px 15px;font-size:14px}
 #tema-sec-paneli{align-items:flex-end}
 .vsec-kart{width:100%;max-width:100%;max-height:78vh;border-radius:20px 20px 0 0}
 .vsec-izg{grid-template-columns:repeat(3,1fr);gap:8px;padding:12px 12px 18px}
 .vsec-kartlik img{height:70px}
 .vsec-kartlik span{font-size:12px;padding:6px 8px}
}
`;
 document.head.append(css); // DÜZELTME 09.11.2026: seçici CSS'i belgeye hiç eklenmiyordu; buton/panel stillenmemiş kalıyordu
 function ursula(){
  const themes=window.VUSLAT_THEMES;
  if(!themes||typeof window.vuslatTemaUygula!=='function')return false;

  const dugme=document.createElement('button');
  dugme.id='tema-sec-dugme';dugme.type='button';dugme.textContent='✦ Temanı Seç';
  dugme.setAttribute('aria-haspopup','dialog');
  const panel=document.createElement('div');
  panel.id='tema-sec-paneli';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Tema seçimi');
  const kart=document.createElement('div');kart.className='vsec-kart';
  const bas=document.createElement('div');bas.className='vsec-bas';
  const baslik=document.createElement('strong');baslik.textContent='Temanı Seç';
  const klasBtn=document.createElement('button');klasBtn.type='button';klasBtn.textContent='Klasik';
  const sinBtn=document.createElement('button');sinBtn.type='button';sinBtn.textContent='Sinematik';
  const kapa=document.createElement('button');kapa.type='button';kapa.textContent='✕';kapa.setAttribute('aria-label','Kapat');
  bas.append(baslik,klasBtn,sinBtn,kapa);
  const izg=document.createElement('div');izg.className='vsec-izg';
  kart.append(bas,izg);panel.append(kart);
  document.body.append(dugme,panel);

  const kartlar=new Map();
  themes.forEach(tr=>{
   const el=document.createElement('button');el.type='button';el.className='vsec-kartlik';el.dataset.id=tr.id;
   el.setAttribute('aria-label',tr.name+' teması');
   const img=document.createElement('img');img.src=tr.bg;img.alt='';img.loading='lazy';
   const yazi=document.createElement('span');yazi.textContent=tr.name;
   el.append(img,yazi);
   el.onclick=()=>{kaydet(tr.id);window.vuslatTemaUygula(tr.id);aktiGuncelle();kapat();};
   kartlar.set(tr.id,el);izg.append(el);
  });

  function aktiGuncelle(){
   const guncelId=window.VUSLAT_CURRENT_THEME?window.VUSLAT_CURRENT_THEME.id:null;
   kartlar.forEach((el,id)=>el.classList.toggle('aktif',id===guncelId));
   const mod=window.VUSLAT_VIDEO_MODU;
   klasBtn.classList.toggle('aktif',mod==='klasik');
   sinBtn.classList.toggle('aktif',mod==='sinematik');
  }
  function acir(){panel.hidden=false;aktiGuncelle();}
  function kapat(){panel.hidden=true;}
  dugme.onclick=()=>panel.hidden?acir():kapat();
  kapa.onclick=kapat;
  panel.addEventListener('click',e=>{if(e.target===panel)kapat();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)kapat();});

  // Klasik/Sinematik: dinleyiciye özel (localStorage), sayfa yenilemeden
  const degistir=m=>{kaydet(window.VUSLAT_CURRENT_THEME.id);window.vuslatTemaUygula(window.VUSLAT_CURRENT_THEME.id,{mod:m});aktiGuncelle();};
  klasBtn.onclick=()=>degistir('klasik');
  sinBtn.onclick=()=>degistir('sinematik');

  window.addEventListener('vuslat-tema-degisti',aktiGuncelle);
  aktiGuncelle();
  return true;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ursula,{once:true});
 else ursula();
})();
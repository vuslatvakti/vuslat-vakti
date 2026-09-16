(()=>{
const endpoint='https://api.github.com/repos/vuslatvakti/vuslat-vakti/contents/aktif-tema.js';
const button=document.getElementById('activate'),input=document.getElementById('token'),status=document.getElementById('status');let busy=false;
document.getElementById('disconnect').onclick=()=>{input.value='';status.textContent='Anahtar temizlendi.'};
window.addEventListener('pagehide',()=>{input.value=''});
async function api(method,token,body){
 const res=await fetch(endpoint+(method==='GET'?'?ref=main':''),{method,redirect:'error',cache:'no-store',headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2026-03-10',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(!res.ok){const messages={401:'Anahtar geçersiz veya süresi dolmuş.',403:'Yazma yetkisi yok, kuruluş onayı bekleniyor veya GitHub istek sınırına ulaşıldı.',404:'Depo veya aktif-tema.js dosyasına erişilemiyor. Anahtarın depo seçimini kontrol et.',409:'Dosya başka yerde değişti. Güncel seçimi kontrol edip yeniden dene.',422:'GitHub değişikliği kabul etmedi. Dal korumasını ve anahtar izinlerini kontrol et.'};throw Error(messages[res.status]||'GitHub işlemi başarısız ('+res.status+').')}
 return res.json();
}
button.onclick=async()=>{
 if(busy)return;const t=window.VUSLAT_THEMES.find(t=>t.id===selected);if(!t)return;
 let token=input.value.trim();if(!token){document.getElementById('auth').open=true;input.focus();status.textContent='Aktif etmek için GitHub bağlantısı bölümüne erişim anahtarını gir.';return}
 busy=true;button.disabled=true;input.value='';status.textContent=t.name+' GitHub’a kaydediliyor…';
 try{
 const current=await api('GET',token);if(!current.sha)throw Error('Güncel dosya doğrulanamadı.');
 const content='window.VUSLAT_ACTIVE_THEME='+JSON.stringify(t.id)+';\n';
 if(current.content&&atob(current.content.replace(/\s/g,'' )).trim()===content.trim()){status.textContent=t.name+' zaten GitHub’da seçili. Yayın durumunu kontrol edebilirsin.'}
 else{await api('PUT',token,{message:'Site teması: '+t.name,content:btoa(content),sha:current.sha,branch:'main'});status.textContent=t.name+' GitHub’a kaydedildi. Site, GitHub Pages yayını tamamlanınca değişecek.'}
 document.getElementById('current').textContent='GitHub’da seçili: '+t.name;
 const a=document.createElement('a');a.href='https://github.com/vuslatvakti/vuslat-vakti/actions';a.target='_blank';a.rel='noopener noreferrer';a.textContent=' Yayın durumunu aç';status.append(a);
 }catch(e){status.textContent=e instanceof TypeError?'GitHub yanıtı alınamadı. Yeniden denemeden önce depodaki aktif-tema.js dosyasını kontrol et.':e.message}
 finally{token='';busy=false;button.disabled=false}
};})();

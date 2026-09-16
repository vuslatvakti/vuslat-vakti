const ALLOWED = new Set(['https://vuslatvakti.github.io','https://vuslatvakti.fm.tc','http://vuslatvakti.fm.tc']);
export default {
 async fetch(request){
  const origin=request.headers.get('Origin');
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Accept'};
  if(origin&&ALLOWED.has(origin))headers['Access-Control-Allow-Origin']=origin;
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(origin&&!ALLOWED.has(origin))return reply({error:'origin_not_allowed'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(request.method!=='GET')return reply({error:'method_not_allowed'},405);
  try{
   const res=await fetch('https://flatcastx.com/radio/live_status.php?room_id=2046&t='+Date.now(),{headers:{Accept:'application/json'},signal:AbortSignal.timeout(8000),redirect:'error'});
   if(!res.ok)throw Error('upstream');
   const data=await res.json();
   if(!data||![0,1,'0','1'].includes(data.is_live))throw Error('invalid_status');
   return reply({is_live:Number(data.is_live),checked_at:new Date().toISOString()});
  }catch{return reply({is_live:null,error:'status_unavailable'},502)}
 }
};

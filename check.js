(function(){
const q=document.getElementById('q'),sug=document.getElementById('sug'),res=document.getElementById('res');
const CT={harris:{n:'Harris',cad:'HCAD',src:'Harris Central Appraisal District roll, tax year 2026, data as of September 27, 2026',v:'https://search.hcad.org/',vn:'HCAD property search'},dallas:{n:'Dallas',cad:'DCAD',src:'Dallas Central Appraisal District certified roll, tax year 2026, data as of July 20, 2026',v:'https://www.dallascad.org/SearchAddr.aspx',vn:'DCAD property search'}};
const sel=document.getElementById('county');const cc=()=>CT[sel.value];const D=()=>'/data/tx/'+sel.value+'/';const cache={};
sel.addEventListener('change',()=>{res.innerHTML='';sug.hidden=true;if(q.value)suggest()});
const get=async u=>cache[u]||(cache[u]=fetch(u).then(r=>{if(!r.ok)throw 0;return r.json()}));
const norm=s=>s.toUpperCase().replace(/[^A-Z0-9 ]/g,'').replace(/\s+/g,' ').trim();
const $=n=>'$'+Math.round(n).toLocaleString('en-US');
const title=s=>s.toLowerCase().replace(/\b[a-z]/g,c=>c.toUpperCase());
let t;
q.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(suggest,120)});
async function suggest(){
 const v=norm(q.value);sug.hidden=true;sug.innerHTML='';
 if(v.length<4)return;
 let idx;try{idx=await get(D()+'i/'+v.slice(0,3).replace(/ /g,'_')+'.json')}catch(e){return}
 const m=idx.filter(r=>r[0].startsWith(v)).slice(0,8);
 if(!m.length){sug.hidden=false;sug.innerHTML='<li><small>No match. Try the street number first, e.g. 1700 St Charles. Single-family homes in Harris County only.</small></li>';return}
 m.forEach(r=>{const li=document.createElement('li');li.innerHTML=title(r[0])+' <small>'+r[1]+'</small>';li.onclick=()=>{q.value=title(r[0]);sug.hidden=true;run(r)};sug.appendChild(li)});
 sug.hidden=false;
}
function pct(a,p){const s=[...a].sort((x,y)=>x-y);const i=(s.length-1)*p,l=Math.floor(i);return s[l]+(s[Math.min(l+1,s.length-1)]-s[l])*(i-l)}
async function run(r){
 res.innerHTML='<p class="mut">Comparing...</p>';
 const sh=await get(D()+'n/'+r[2].replace('/','_')+'.json');
 const me=sh.find(x=>x[0]===r[3]);if(!me){res.innerHTML='<p>Record not found.</p>';return}
 let [acct,addr,sf,yr,land,qa,mkt,asd,prior]=me;
 const C=cc();const MIN=8;if(!(asd>0))asd=mkt;let pool=sh.filter(x=>x[0]!==acct&&x[2]>300&&x[6]>0&&sf>300&&Math.abs(x[2]-sf)<=0.2*sf&&Math.abs(x[3]-yr)<=10&&x[3]>0&&(land<=0||x[4]<=0||(x[4]>=0.5*land&&x[4]<=1.5*land)));
 let pq=qa?pool.filter(x=>x[5]===qa):[];let usedQ=false;if(pq.length>=MIN){pool=pq;usedQ=true}
 let html='';
 const mp=mkt/Math.max(sf,1);
 if(sf<=300||mkt<=0||pool.length<MIN){
  html+='<div class="verdict nd">We do not have enough data for this property yet</div><p class="mut">Found '+pool.length+' similar homes in your '+C.cad+' neighborhood ('+r[2]+'); we need at least '+MIN+'.</p>';
 }else{
  pool.forEach(x=>x.p=x[6]/x[2]);
  const ps=pool.map(x=>x.p),med=pct(ps,.5),p75=pct(ps,.75);
  const below=ps.filter(p=>p<mp).length;
  const high=mp>=p75&&mp>=1.1*med;
  const cls=high?'high':'';
  const head=high?'Your assessment looks high compared with similar homes':'Your assessment looks in line with similar homes';
  html+='<div class="verdict '+cls+'">'+head+'</div>';
  const medVal=med*sf;let eff='';
  if(high){const newT=Math.min(asd,medVal);const red=Math.max(0,asd-newT);
   eff='<p class="mut">Rough tax context: if your value matched the median of these homes per square foot, your taxable value could differ by about '+$(Math.round(red/1000)*1000)+', or roughly '+$(Math.round(red*0.018/10)*10)+' to '+$(Math.round(red*0.026/10)*10)+' a year at an assumed 1.8% to 2.6% combined rate. This is an estimate, not a prediction. Caps and exemptions can change it.</p>';}
  html+='<div class="grid"><div class="stat">County market value<b>'+$(mkt)+'</b></div><div class="stat">Per sq ft<b>$'+mp.toFixed(0)+'</b></div><div class="stat">Median of similar homes<b>$'+med.toFixed(0)+'</b></div><div class="stat">Higher than<b>'+below+' of '+pool.length+'</b></div></div>'+eff;
  const top=[...pool].sort((a,b)=>Math.abs(a[2]-sf)/sf+Math.abs(a[3]-yr)/40-Math.abs(b[2]-sf)/sf-Math.abs(b[3]-yr)/40).slice(0,12);
  html+='<h3>Similar homes (closest 12 of '+pool.length+')</h3><table><tr><th>Address</th><th>Sq ft</th><th>Built</th><th>Value</th><th>$/sf</th></tr>'+
  '<tr class="me"><td>'+title(addr)+' (yours)</td><td>'+sf.toLocaleString()+'</td><td>'+yr+'</td><td>'+$(mkt)+'</td><td>$'+mp.toFixed(0)+'</td></tr>'+
  top.map(x=>'<tr><td>'+title(x[1])+'</td><td>'+x[2].toLocaleString()+'</td><td>'+x[3]+'</td><td>'+$(x[6])+'</td><td>$'+x.p.toFixed(0)+'</td></tr>').join('')+'</table>';
  html+='<p class="mut">Comps: same '+C.cad+' neighborhood code '+r[2]+', living area within 20%, built within 10 years, lot size within 50%'+(usedQ?', same quality grade':'')+'.</p>';
 }
 if(asd&&asd<mkt)html+='<div class="note">Your appraised value ('+$(asd)+') is below the county market value ('+$(mkt)+'), which usually means a cap applies. A lower market value may not change your bill this year.</div>';
 html+='<p class="mut">Source: Harris Central Appraisal District roll, tax year 2026, data as of September 27, 2026. Account '+acct+'. Verify on <a href="'+C.v+'" rel="noopener">'+C.vn+'</a>. This compares county records. It is not an appraisal. We do not file or represent you.</p>';
 html+='<div class="card"><button disabled>Evidence packet: coming soon</button><p class="mut">A free evidence packet and deadline reminders are planned. Nothing is sold and no card is ever asked for.</p></div>';
 res.innerHTML=html;res.scrollIntoView({behavior:'smooth'});
}

if(location.hash.startsWith('#q=')){let h=decodeURIComponent(location.hash.slice(3));if(h.includes('|')){sel.value=h.split('|')[0];h=h.split('|')[1]}q.value=h;suggest().then(()=>{const f=sug.querySelector('li');if(f&&f.onclick)f.click()})}
})();

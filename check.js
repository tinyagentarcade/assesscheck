(function(){
const q=document.getElementById('q'),sug=document.getElementById('sug'),res=document.getElementById('res');
const FL=(n,v,vn)=>({st:'fl',n:n,cad:'property appraiser',src:n+' County Property Appraiser data as published by the Florida Department of Revenue, 2026 roll'+(n==='Orange'?' (final)':' (preliminary, July 2026)'),v:v,vn:vn});
const CT={'tx/harris':{st:'tx',n:'Harris',cad:'HCAD',src:'Harris Central Appraisal District roll, tax year 2026, data as of September 27, 2026',v:'https://search.hcad.org/',vn:'HCAD property search'},'tx/dallas':{st:'tx',n:'Dallas',cad:'DCAD',src:'Dallas Central Appraisal District certified roll, tax year 2026, data as of July 20, 2026',v:'https://www.dallascad.org/SearchAddr.aspx',vn:'DCAD property search'},'fl/broward':FL('Broward','https://web.bcpa.net/BcpaClient/','Broward County Property Appraiser search'),'fl/dade':FL('Miami-Dade','https://apps.miamidadepa.gov/PropertySearch/','Miami-Dade Property Appraiser search'),'fl/hillsborough':FL('Hillsborough','https://gis.hcpafl.org/propertysearch/','Hillsborough County Property Appraiser search'),'fl/orange':FL('Orange','https://ocpaweb.ocpafl.org/parcelsearch','Orange County Property Appraiser search')};
const sel=document.getElementById('county');const cc=()=>CT[sel.value];const D=()=>'/data/'+sel.value+'/';const cache={};
sel.addEventListener('change',()=>{res.innerHTML='';sug.hidden=true;if(q.value)suggest()});
async function getShard(d,code){const m=await get(d+'manifest.json');const b=m.shard_buckets;let x=5381;for(const c of code)x=(Math.imul(x,33)+c.charCodeAt(0))>>>0;const f=await get(d+'n/'+(x%b)+'.json');return f[code]||[]}
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
function __ev(e){try{if(location.hostname!=='assesscheck.pages.dev')return;fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({e:e,c:sel.value}),keepalive:true}).catch(()=>{})}catch(x){}}
window.__gate=true; // flip to true only after /api/subscribe is live
function gateForm(){if(!window.__gate)return '';return '<div class="card"><b>Optional: get notified when deadline reminders launch</b><p class="mut">Leave your email and we will notify you when deadline reminders launch for your county. We do not send anything now and we will not email you to confirm. We never sell or share your email. To be removed, email 2kgnzy@mail.instinct.com. No card, no payment.</p><input id="gateEmail" type="email" placeholder="you@example.com" autocomplete="email"><input id="gateHp" type="text" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px"> <button onclick="window.__gateSend()">Notify me</button> <span id="gateMsg" class="mut"></span></div>'}
window.__gateSend=async function(){const m=document.getElementById('gateMsg');m.textContent='Sending...';try{const r=await fetch('/api/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:document.getElementById('gateEmail').value,county:sel.value,hp:document.getElementById('gateHp').value})});const j=await r.json();m.textContent=j.ok?'Saved. Nothing will be sent until reminders launch.':(j.error||'Something went wrong.')}catch(e){m.textContent='Something went wrong.'}};
function pkBtn(){return window.__pk?'<div class="card"><button onclick="window.__mkPacket()">Get your free evidence packet</button><p class="mut">Opens a printable packet in a new tab. Nothing is stored or sent anywhere; use your browser Print / Save as PDF. You prepare, sign and file your own appeal.</p></div>':'<div class="card"><p class="mut">No evidence packet is available for this result because there is not enough comparison data.</p></div>'}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
window.__mkPacket=function(){
 const k=window.__pk;if(!k)return;const C=k.C;const fl=C.st==='fl';
 const today=new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
 const harris=C.n==='Harris';
 const steps=fl?
 ['Find the Notice of Proposed Property Taxes (TRIM notice) your county property appraiser mailed you and note the petition deadline printed on it.','Read the Florida Department of Revenue page on the Value Adjustment Board: <a href="https://floridarevenue.com/property/Pages/VAB.aspx">floridarevenue.com/property/Pages/VAB.aspx</a>. Per the Department, petitions are filed with the VAB clerk in the county where the property is located.','Gather the evidence in this packet. Add anything about your home that county records do not show (condition, repairs, photos).','File your own petition with your county VAB clerk by the deadline. Keep copies of everything you file and note your hearing date.']:
 ['Find your notice of appraised value from your appraisal district and note the protest deadline printed on it.','Read your appraisal district protest instructions: <a href="'+(harris?'https://hcad.org/hcad-help/protests-and-corrections/':'https://www.dallascad.org/')+'">'+(harris?'hcad.org/hcad-help/protests-and-corrections':'dallascad.org')+'</a>. Forms, filing methods and hearing rules are set by the district.','Gather the evidence in this packet. Add anything about your home that county records do not show (condition, repairs, photos).','File your own protest with your appraisal district by the deadline. Keep copies of everything you file and note your hearing date.'];
 const comps=k.comps.slice(0,25);
 const rows=comps.map(x=>'<tr><td>'+esc(x.addr)+'</td><td>'+x.sf.toLocaleString()+'</td><td>'+x.yr+'</td><td>'+$(x.val)+(x.date?' ('+x.date+')':'')+'</td><td>$'+x.psf.toFixed(0)+'</td></tr>').join('');
 const valLabel=fl?'County just value':'County market value';
 const css='body{font:14px/1.5 system-ui,Arial,sans-serif;color:#111;max-width:760px;margin:0 auto;padding:24px}h1{font-size:24px}h2{font-size:18px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-top:28px}table{border-collapse:collapse;width:100%}th,td{border-bottom:1px solid #ddd;padding:5px 6px;text-align:right}th:first-child,td:first-child{text-align:left}.pb{page-break-before:always}.me td{font-weight:700;background:#eef5f3}.box{border:1px solid #999;padding:10px 14px;border-radius:6px;margin:12px 0}.blank{border-bottom:1px solid #000;display:inline-block;min-width:220px}footer{margin-top:28px;font-size:11px;color:#444;border-top:1px solid #ccc;padding-top:8px}@media print{.noprint{display:none}}';
 let d='<!doctype html><html><head><meta charset="utf-8"><title>Evidence packet - '+esc(k.addr)+'</title><style>'+css+'</style></head><body>';
 d+='<p class="noprint"><button onclick="window.print()">Print / Save as PDF</button></p>';
 d+='<h1>Property tax evidence packet</h1><p><b>'+esc(k.addr)+'</b><br>'+esc(C.n)+' County, '+(fl?'FL':'TX')+'<br>'+(fl?'Parcel ID: ':'Account: ')+esc(k.acct)+'<br>Prepared '+today+' by AssessCheck (self-help tool built and operated by an AI agent; a person set the goal).</p>';
 d+='<div class="box"><b>Result of the comparison:</b> '+esc(k.verdict)+'. This compares county records only. It is not an appraisal, and it does not state what your home is worth.</div>';
 d+='<h2>1. Your property, from county records</h2><table><tr><td>Living area</td><td>'+k.sf.toLocaleString()+' sq ft</td></tr><tr><td>Year built</td><td>'+k.yr+'</td></tr><tr><td>Lot size</td><td>'+(k.land?k.land.toLocaleString()+' sq ft':'not listed')+'</td></tr><tr><td>'+valLabel+'</td><td>'+$(k.val)+' ($'+k.mp.toFixed(0)+' per sq ft)</td></tr><tr><td>Assessed value</td><td>'+(k.asd?$(k.asd):'not listed')+'</td></tr></table>';
 d+='<p>Source: '+esc(C.src)+'. Verify on the county site: <a href="'+C.v+'">'+esc(C.vn)+'</a>.</p>';
 d+='<h2>2. '+(k.mode==='sales'?'Recent sales of similar homes':'Similar homes in your neighborhood')+'</h2>';
 d+='<p>'+k.n+' comparable homes found'+(k.mode==='sales'?' (qualified, single-parcel sales since July 2024)':'')+'. Median '+(k.mode==='sales'?'sale price':'county value')+' per sq ft: $'+k.med.toFixed(0)+'. Yours: $'+k.mp.toFixed(0)+'.'+(k.below!=null?' Your county value per sq ft is higher than '+k.below+' of '+k.n+' similar homes.':'')+' Closest '+comps.length+' shown.</p>';
 d+='<table><tr><th>Address</th><th>Sq ft</th><th>Built</th><th>'+(k.mode==='sales'?'Sold for (date)':'County value')+'</th><th>$/sq ft</th></tr><tr class="me"><td>'+esc(k.addr)+' (yours)</td><td>'+k.sf.toLocaleString()+'</td><td>'+k.yr+'</td><td>'+$(k.val)+'</td><td>$'+k.mp.toFixed(0)+'</td></tr>'+rows+'</table>';
 d+='<p>Every number above comes from '+esc(C.src)+'. How comparables are chosen: see the Methodology page on the AssessCheck site. County values are not sale prices, and county data cannot see condition or upgrades.</p>';
 d+='<h2>3. How to file</h2><ol>'+steps.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
 d+='<div class="box"><b>Deadline:</b> <span class="blank"></span><br><small>Write the deadline from your notice here. Deadlines are set by your county and can change. Confirm on your county official page.</small></div>';
 if(fl&&k.asd&&k.asd<k.val)d+='<div class="box"><b>Assessment limit:</b> your assessed value ('+$(k.asd)+') is below the just value ('+$(k.val)+'). A lower just value only lowers your taxes if it falls below the assessed value.</div>';
 if(!fl&&k.asd&&k.asd<k.val)d+='<div class="box"><b>Appraisal cap:</b> your appraised value ('+$(k.asd)+') is below the market value ('+$(k.val)+'). A lower market value may not change your bill this year.</div>';
 d+='<h2 class="pb">4. Letter template (edit it, sign it, and send it yourself)</h2>';
 d+='<p>Date: <span class="blank"></span></p><p>To: '+(fl?'Clerk, Value Adjustment Board, ':'Appraisal Review Board / ')+esc(C.n)+' County</p><p>Re: Property at '+esc(k.addr)+', '+(fl?'Parcel ID ':'Account ')+esc(k.acct)+'</p>';
 d+='<p>I am the owner of the property above. I disagree with the '+(fl?'just':'market')+' value of '+$(k.val)+' set for 2026 and I am asking for a review.</p>';
 d+='<p>I am attaching county records for similar homes in my neighborhood. [Add anything specific about your home, such as condition, repairs or photos, that the county records do not show.]</p>';
 d+='<p>My requested value: <span class="blank"></span></p><p>Name: <span class="blank"></span> &nbsp; Phone/email: <span class="blank"></span><br><br>Signature: <span class="blank"></span></p>';
 d+='<p><small>This template is a starting point only. Check your county own form and instructions. You file it yourself; AssessCheck does not file or sign anything for you.</small></p>';
 d+='<h2>5. Hearing checklist</h2><ul><li>Note the date, time and place (or online link) of your hearing.</li><li>Bring or upload this packet, your notice, and any photos or repair estimates.</li><li>Be ready to say in one minute which comparable homes you rely on and why.</li><li>Ask what evidence the county will present and request a copy if allowed.</li><li>Keep copies of everything and note the decision date.</li></ul>';
 d+='<h2 class="pb">6. Important information</h2><p>AssessCheck is an independent self-help tool built and operated by an AI agent; a person set the goal. We are not a law firm, appraiser, accountant, tax consultant, or government agency, and we do not represent you or file anything for you. You prepare, sign, and file your own appeal. Information comes from public county records and may be incomplete or out of date. Comparisons are not appraisals or legal or tax advice. We cannot predict or guarantee any result. Filing deadlines and rules are set by your county and can change; confirm them on your county official pages before you act.</p>';
 d+='<footer>Self-help tool built and operated by an AI agent. Not legal, tax, or appraisal advice. No guarantee of results. Confirm deadlines with your county. Generated '+today+' in your browser; nothing was sent to anyone.</footer></body></html>';
 const w=window.open('','_blank');if(!w){alert('Please allow pop-ups to open the packet.');return}__ev('packet_opened');w.document.open();w.document.write(d);w.document.close();
};
function pct(a,p){const s=[...a].sort((x,y)=>x-y);const i=(s.length-1)*p,l=Math.floor(i);return s[l]+(s[Math.min(l+1,s.length-1)]-s[l])*(i-l)}

function runFL(r,sh,me,C){
 window.__pk=null;
 const [pid,addr,sf,yr,land,jv,av,hs,sp,sd]=me;
 const ok=x=>x[0]!==pid&&x[2]>300&&x[5]>0&&sf>300&&Math.abs(x[2]-sf)<=0.2*sf&&x[3]>0&&yr>0&&Math.abs(x[3]-yr)<=15&&(land<=0||x[4]<=0||(x[4]>=0.5*land&&x[4]<=1.5*land));
 const base=sh.filter(ok);
 const sales=base.filter(x=>x[8]>0&&x[9]>=202407);
 const mp=jv/Math.max(sf,1);let html='';let mode='';
 const me2=(arr,f)=>arr.map(f);
 const rowsHtml=(top,valf)=>top.map(x=>'<tr><td>'+title(x[1])+'</td><td>'+x[2].toLocaleString()+'</td><td>'+x[3]+'</td><td>'+valf(x)+'</td></tr>').join('');
 if(sf<=300||jv<=0||(sales.length<5&&base.length<8)){
  html+='<div class="verdict nd">We do not have enough data for this property yet</div><p class="mut">Found '+sales.length+' recent sales and '+base.length+' similar homes in your neighborhood area; we need at least 5 sales or 8 similar homes.</p>';
 }else{
  let high=false,head;
  if(sales.length>=5){
   mode='sales';const ps=sales.map(x=>x[8]/x[2]);const med=pct(ps,.5);
   high=mp>=med*1.0&&mp>=pct(ps,.6);
   head=high?'The county value looks high compared with recent sales of similar homes':'The county value looks in line with recent sales of similar homes';
   html+='<div class="verdict '+(high?'high':'')+'">'+head+'</div>';
   window.__pk={C,acct:pid,addr,sf,yr,land,val:jv,asd:av,mode:'sales',verdict:head,mp,med,n:sales.length,comps:[...sales].sort((a,b)=>Math.abs(a[2]-sf)/sf-Math.abs(b[2]-sf)/sf).map(x=>({addr:x[1],sf:x[2],yr:x[3],val:x[8],psf:x[8]/x[2],date:String(x[9]).slice(0,4)+'-'+String(x[9]).slice(4)}))};
   html+='<div class="grid"><div class="stat">County just value<b>'+$(jv)+'</b></div><div class="stat">Per sq ft<b>$'+mp.toFixed(0)+'</b></div><div class="stat">Median sale price per sq ft<b>$'+med.toFixed(0)+'</b></div><div class="stat">Recent sales used<b>'+sales.length+'</b></div></div>';
   const top=[...sales].sort((a,b)=>Math.abs(a[2]-sf)/sf-Math.abs(b[2]-sf)/sf).slice(0,12);
   html+='<h3>Recent sales of similar homes (closest '+top.length+' of '+sales.length+')</h3><table><tr><th>Address</th><th>Sq ft</th><th>Built</th><th>Sold for (date)</th></tr>'+
   '<tr class="me"><td>'+title(addr)+' (yours)</td><td>'+sf.toLocaleString()+'</td><td>'+yr+'</td><td>just value '+$(jv)+'</td></tr>'+
   rowsHtml(top,x=>$(x[8])+' ('+String(x[9]).slice(0,4)+'-'+String(x[9]).slice(4)+')')+'</table>';
   html+='<p class="mut">Sales: qualified, single-parcel sales since July 2024 in the same county neighborhood code '+r[2]+', living area within 20%, built within 15 years, lot size within 50%. County just value is not expected to equal a sale price; a sale reflects condition, timing and terms we cannot see.</p>';
  }else{
   mode='equity';const ps=base.map(x=>x[5]/x[2]);const med=pct(ps,.5),p75=pct(ps,.75);const below=ps.filter(p=>p<mp).length;
   high=mp>=p75&&mp>=1.1*med;
   head=high?'The county value looks high compared with similar homes':'The county value looks in line with similar homes';
   html+='<div class="verdict '+(high?'high':'')+'">'+head+'</div>';
   window.__pk={C,acct:pid,addr,sf,yr,land,val:jv,asd:av,mode:'equity',verdict:head,mp,med,below,n:base.length,comps:[...base].sort((a,b)=>Math.abs(a[2]-sf)/sf-Math.abs(b[2]-sf)/sf).map(x=>({addr:x[1],sf:x[2],yr:x[3],val:x[5],psf:x[5]/x[2]}))};
   html+='<div class="grid"><div class="stat">County just value<b>'+$(jv)+'</b></div><div class="stat">Per sq ft<b>$'+mp.toFixed(0)+'</b></div><div class="stat">Median of similar homes<b>$'+med.toFixed(0)+'</b></div><div class="stat">Higher than<b>'+below+' of '+base.length+'</b></div></div>';
   const top=[...base].sort((a,b)=>Math.abs(a[2]-sf)/sf-Math.abs(b[2]-sf)/sf).slice(0,12);
   html+='<h3>Similar homes (closest '+top.length+' of '+base.length+')</h3><table><tr><th>Address</th><th>Sq ft</th><th>Built</th><th>Just value</th></tr>'+
   '<tr class="me"><td>'+title(addr)+' (yours)</td><td>'+sf.toLocaleString()+'</td><td>'+yr+'</td><td>'+$(jv)+'</td></tr>'+rowsHtml(top,x=>$(x[5]))+'</table>';
   html+='<p class="mut">Fewer than 5 recent qualified sales were found, so this compares county just values only (same neighborhood code '+r[2]+', size within 20%, built within 15 years, lot within 50%).</p>';
  }
  if(high){
   const tgt=mode==='sales'?pct(sales.map(x=>x[8]/x[2]),.5)*sf:pct(base.map(x=>x[5]/x[2]),.5)*sf;
   const eff=Math.max(0,av-Math.min(av,tgt));
   html+='<p class="mut">Rough tax context: if the just value matched the median above, the assessed value that taxes are based on could drop by about '+$(Math.round(eff/1000)*1000)+(eff>0?', roughly '+$(Math.round(eff*0.014/10)*10)+' to '+$(Math.round(eff*0.022/10)*10)+' a year at an assumed 1.4% to 2.2% combined rate':'')+'. This is an estimate, not a prediction.</p>';
  }
 }
 if(av>0&&av<jv){
  html+='<div class="note">Your assessed value for county and city taxes ('+$(av)+') is below the just value ('+$(jv)+') because of '+(hs===1?'the Save Our Homes homestead limit':(hs===2?'the 10% limit on non-homestead residential property':'an assessment limitation'))+'. A lower just value only lowers your taxes if it falls below the assessed value. See <a href="https://floridarevenue.com/property/Documents/SaveOurHomes.pdf" rel="noopener">Florida DOR: Save Our Homes</a>.</div>';
 }
 html+='<p class="mut">Source: '+C.src+'. Parcel '+pid+'. Verify on the <a href="'+C.v+'" rel="noopener">'+C.vn+'</a>. This compares county records. It is not an appraisal. We do not file or represent you.</p>';
 html+=pkBtn()+gateForm();
 res.innerHTML=html;res.scrollIntoView({behavior:'smooth'});if(window.__pk)__ev('lookup_completed');
}
async function run(r){
 window.__pk=null;
 res.innerHTML='<p class="mut">Comparing...</p>';
 const sh=await getShard(D(),r[2].replace('/','_'));
 const me=sh.find(x=>x[0]===r[3]);if(!me){res.innerHTML='<p>Record not found.</p>';return}
 let [acct,addr,sf,yr,land,qa,mkt,asd,prior]=me;
 const C=cc();if(C.st==='fl'){return runFL(r,sh,me,C)}
 const MIN=8;if(!(asd>0))asd=mkt;let pool=sh.filter(x=>x[0]!==acct&&x[2]>300&&x[6]>0&&sf>300&&Math.abs(x[2]-sf)<=0.2*sf&&Math.abs(x[3]-yr)<=10&&x[3]>0&&(land<=0||x[4]<=0||(x[4]>=0.5*land&&x[4]<=1.5*land)));
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
  window.__pk={C,acct,addr,sf,yr,land,val:mkt,asd,mode:'equity',verdict:head,mp,med,below,n:pool.length,comps:[...pool].sort((a,b)=>Math.abs(a[2]-sf)/sf+Math.abs(a[3]-yr)/40-Math.abs(b[2]-sf)/sf-Math.abs(b[3]-yr)/40).map(x=>({addr:x[1],sf:x[2],yr:x[3],val:x[6],psf:x[6]/x[2]}))};
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
 html+=pkBtn()+gateForm();
 res.innerHTML=html;res.scrollIntoView({behavior:'smooth'});if(window.__pk)__ev('lookup_completed');
}

{const cp=new URLSearchParams(location.search).get('c');if(cp&&CT[cp])sel.value=cp}
if(location.hash.startsWith('#q=')){let h=decodeURIComponent(location.hash.slice(3));if(h.includes('|')){sel.value=h.split('|')[0];h=h.split('|')[1]}q.value=h;suggest().then(()=>{const f=sug.querySelector('li');if(f&&f.onclick)f.click()})}
})();

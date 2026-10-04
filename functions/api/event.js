// POST /api/event {e, c}. Counts coarse outcome events. Stores only event + UTC day + county slug + a count.
// No IP, address, parcel, email, user agent, cookie or identifier is stored.
const EV=['lookup_completed','packet_opened'];
const CO=['tx/harris','tx/dallas','fl/broward','fl/dade','fl/hillsborough','fl/orange'];
const PROD='assesscheck.pages.dev';
const DAILY_CAP=20000; // per event per day; stops bloat/abuse
const seen=new Map(); // per-isolate, in memory only, never persisted
const R=(s)=>new Response(null,{status:s});
export async function onRequestPost({request,env}){
  const host=new URL(request.url).hostname;
  if(host!==PROD)return R(204); // previews, localhost and QA hosts are never counted
  const len=+request.headers.get('content-length')||0;
  if(len>200)return R(413);
  let b;try{b=JSON.parse(await request.text())}catch(e){return R(400)}
  if(!EV.includes(b.e)||!CO.includes(b.c))return R(400);
  // transient throttle: 30 events/min per connection, held in memory only
  const k=request.headers.get('cf-connecting-ip')||'x',m=Math.floor(Date.now()/60000),v=seen.get(k);
  if(v&&v.m===m){if(++v.n>30)return R(429)}else{if(seen.size>5000)seen.clear();seen.set(k,{m,n:1})}
  const day=new Date().toISOString().slice(0,10);
  const row=await env.DB.prepare('SELECT SUM(n) AS t FROM events WHERE day=? AND event=?').bind(day,b.e).first();
  if(row&&row.t>=DAILY_CAP)return R(204);
  await env.DB.prepare('INSERT INTO events(day,event,county,n) VALUES(?,?,?,1) ON CONFLICT(day,event,county) DO UPDATE SET n=n+1').bind(day,b.e,b.c).run();
  return R(204);
}

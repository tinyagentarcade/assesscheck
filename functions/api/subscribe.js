// POST /api/subscribe {email, county, hp}. Capture only: stores the signup, sends NOTHING.
// Bindings: DB (D1). No mail secrets needed.
const COUNTIES=['tx/harris','tx/dallas','fl/broward','fl/dade','fl/hillsborough','fl/orange'];
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
export async function onRequestPost({request,env}){
  let b;try{b=await request.json()}catch(e){return J({ok:false},400)}
  if(b.hp)return J({ok:true});
  const email=String(b.email||'').trim().toLowerCase();
  if(!/^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s]{2,}$/.test(email)||email.length>254)return J({ok:false,error:'Enter a valid email.'},400);
  if(!COUNTIES.includes(b.county))return J({ok:false},400);
  const now=new Date().toISOString();
  const token=[...crypto.getRandomValues(new Uint8Array(24))].map(x=>x.toString(16).padStart(2,'0')).join('');
  await env.DB.prepare('INSERT INTO subs(email,county,token,consent_at) VALUES(?,?,?,?) ON CONFLICT(email) DO UPDATE SET county=excluded.county,consent_at=excluded.consent_at,unsub_at=NULL').bind(email,b.county,token,now).run();
  return J({ok:true});
}

// POST /api/subscribe  {email, county, hp}
// Bindings: DB (D1), secret BREVO_API_KEY. Vars: SENDER_EMAIL, SITE_URL.
const COUNTIES=['tx/harris','tx/dallas','fl/broward','fl/dade','fl/hillsborough','fl/orange'];
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
export async function onRequestPost({request,env}){
  let b;try{b=await request.json()}catch(e){return J({ok:false},400)}
  if(b.hp)return J({ok:true}); // honeypot
  const email=String(b.email||'').trim().toLowerCase();
  if(!/^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s]{2,}$/.test(email)||email.length>254)return J({ok:false,error:'Enter a valid email.'},400);
  if(!COUNTIES.includes(b.county))return J({ok:false},400);
  const row=await env.DB.prepare('SELECT confirmed_at,unsub_at,last_sent_at FROM subs WHERE email=?').bind(email).first();
  const now=new Date().toISOString();
  // throttle: at most one confirmation email per address per hour
  if(row&&row.last_sent_at&&Date.now()-Date.parse(row.last_sent_at)<3600000)return J({ok:true});
  if(row&&row.confirmed_at&&!row.unsub_at)return J({ok:true});
  const token=[...crypto.getRandomValues(new Uint8Array(24))].map(x=>x.toString(16).padStart(2,'0')).join('');
  await env.DB.prepare('INSERT INTO subs(email,county,token,consent_at,last_sent_at) VALUES(?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET county=excluded.county,token=excluded.token,consent_at=excluded.consent_at,unsub_at=NULL,confirmed_at=NULL,last_sent_at=excluded.last_sent_at').bind(email,b.county,token,now,now).run();
  const site=env.SITE_URL||new URL(request.url).origin;
  const link=site+'/api/confirm?t='+token;
  const html='<p>Please confirm your email for AssessCheck updates.</p><p><a href="'+link+'">Confirm my email</a></p><p>You asked to be told when appeal deadlines for your county are confirmed. We have not confirmed official dates yet and will not guess them. Nothing else will be sent. If you did not ask for this, ignore this message and nothing happens.</p><p style="font-size:12px;color:#555">AssessCheck is a self-help tool built and operated by an AI agent; a person set the goal. Not legal, tax, or appraisal advice.</p>';
  const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':env.BREVO_API_KEY,'content-type':'application/json'},body:JSON.stringify({sender:{name:'AssessCheck',email:env.SENDER_EMAIL},to:[{email}],subject:'Confirm your email for AssessCheck',htmlContent:html})});
  if(!r.ok)return J({ok:false,error:'Could not send the confirmation email right now.'},502);
  return J({ok:true});
}

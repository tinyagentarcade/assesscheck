export async function onRequestGet({request,env}){
  const t=new URL(request.url).searchParams.get('t')||'';
  let ok=false;
  if(/^[0-9a-f]{48}$/.test(t)){const r=await env.DB.prepare('UPDATE subs SET confirmed_at=? WHERE token=? AND unsub_at IS NULL').bind(new Date().toISOString(),t).run();ok=r.meta.changes>0}
  const unsub='/api/unsubscribe?t='+t;
  return new Response('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><body style="font:16px system-ui;max-width:560px;margin:40px auto;padding:0 16px"><h1>'+(ok?'Email confirmed':'Link not valid')+'</h1><p>'+(ok?'We will email you when appeal deadlines for your county are confirmed. We do not have official dates yet.':'This link is invalid or already used.')+'</p>'+(ok?'<p><a href="'+unsub+'">Unsubscribe</a></p>':'')+'<p><a href="/">Back to AssessCheck</a></p>',{headers:{'content-type':'text/html;charset=utf-8'}});
}

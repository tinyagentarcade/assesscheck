export async function onRequestGet({request,env}){
  const t=new URL(request.url).searchParams.get('t')||'';
  if(/^[0-9a-f]{48}$/.test(t))await env.DB.prepare('UPDATE subs SET unsub_at=? WHERE token=?').bind(new Date().toISOString(),t).run();
  return new Response('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><body style="font:16px system-ui;max-width:560px;margin:40px auto;padding:0 16px"><h1>Unsubscribed</h1><p>You will not get further email from AssessCheck.</p><p><a href="/">Back to AssessCheck</a></p>',{headers:{'content-type':'text/html;charset=utf-8'}});
}

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const COOKIE = '__Host-sb_rank';
const PUBLIC_READS = new Set(['sb_rank_board', 'sb_rank_profile', 'sb_rank_clans']);
const AUTH_ACTIONS = new Set(['sb_rank_register', 'sb_rank_set_avatar', 'sb_rank_start', 'sb_rank_finish', 'sb_rank_change_clan', 'sb_rank_hero_places']);
const json = (data, status = 200, cookie) => Response.json(data, {
  status, headers: { 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) },
});

function sessionCookie(session, key) {
  if (!session) return COOKIE + '=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax';
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encoded = Buffer.concat([cipher.update(JSON.stringify(session), 'utf8'), cipher.final()]);
  const value = Buffer.concat([iv, cipher.getAuthTag(), encoded]).toString('base64url');
  return COOKIE + '=' + value + '; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax';
}

function readSession(request, key) {
  const value = request.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith(COOKIE + '='));
  if (!value) return null;
  try {
    const bytes = Buffer.from(value.slice(COOKIE.length + 1), 'base64url');
    const decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    return JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8'));
  } catch { return null; }
}

function sessionData(data) {
  return { access: data.access_token, refresh: data.refresh_token, expiry: data.expires_at ?? Math.floor(Date.now()/1000)+data.expires_in };
}
function playerData(user) {
  return { id: user.id, alias: typeof user.user_metadata?.alias === 'string' ? user.user_metadata.alias : undefined };
}

export default async function handler(request) {
  const { RANK_SUPABASE_URL: base, RANK_SUPABASE_KEY: apiKey, RANK_PUBLIC_ORIGIN: site, RANK_SESSION_SECRET: secret } = process.env;
  if (!base || !apiKey || !site || !/^[a-f0-9]{64}$/i.test(secret ?? '')) {
    return json({ error:'Ranking online indisponível.' }, 503);
  }
  const key = Buffer.from(secret, 'hex');
  const upstream = async (path, body, bearer, method = 'POST') => {
    const response = await fetch(new URL(path, base), {
      method,
      headers: { apikey: apiKey, 'Content-Type': 'application/json', ...(bearer ? { Authorization:'Bearer '+bearer } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return { ok:response.ok, status:response.status, data };
  };
  try {
    if (request.method === 'GET') {
      const token = new URL(request.url).searchParams.get('confirm');
      if (!token || !/^[a-zA-Z0-9_-]{10,180}$/.test(token)) return json({ error:'Confirmação inválida.' },400);
      const verified = await upstream('/auth/v1/verify', { token_hash:token, type:'email' });
      const headers = { Location:site, 'Cache-Control':'no-store' };
      if (verified.ok && verified.data?.access_token) headers['Set-Cookie'] = sessionCookie(sessionData(verified.data),key);
      return new Response(null,{status:303,headers});
    }
    if (request.method !== 'POST') return json({error:'Método inválido.'},405);
    if (request.headers.get('origin') !== site) return json({error:'Origem não autorizada.'},403);
    const raw = await request.text();
    if (raw.length > 22_000) return json({error:'Requisição grande demais.'},413);
    let input;
    try { input = JSON.parse(raw); } catch { return json({error:'Requisição inválida.'},400); }
    const action = input?.action;
    let session = readSession(request,key), cookie;
    if (action === 'signup' || action === 'login') {
      const email = input.email, password = input.password, alias = input.alias;
      if (typeof email !== 'string' || email.length>254 || typeof password !== 'string' || password.length<8 || password.length>128) {
        return json({error:'Confira e-mail e senha.'},400);
      }
      if (action === 'signup' && (typeof alias!=='string'||!/^[-_\p{L}\p{N}]{3,20}$/u.test(alias))) {
        return json({error:'Escolha um nome de 3 a 20 letras, números, hífens ou sublinhados.'},400);
      }
      const data = action === 'signup' ? {email,password,data:{alias}} : {email,password};
      const auth = await upstream(action === 'signup' ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password',data);
      if (!auth.ok) return json({error:auth.status===429?'Tente mais tarde.':'Não foi possível acessar a conta. Confira os dados.'},auth.status);
      if (!auth.data?.access_token) return json({confirmEmail:true});
      return json({player:playerData(auth.data.user)},200,sessionCookie(sessionData(auth.data),key));
    }
    if (session && session.expiry < Date.now()/1000 + 45) {
      const fresh = await upstream('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh});
      session = fresh.ok && fresh.data?.access_token ? sessionData(fresh.data) : null;
      cookie = sessionCookie(session,key);
    }
    if (action === 'logout') {
      if (session) await upstream('/auth/v1/logout',undefined,session.access).catch(()=>{});
      return json(null,200,sessionCookie(null,key));
    }
    if (action === 'session') {
      if (!session) return json(null,200,cookie);
      const user = await upstream('/auth/v1/user',undefined,session.access,'GET');
      return json(user.ok?playerData(user.data):null,200,cookie);
    }
    if (action === 'alias') {
      if (!session) return json({error:'Entre na conta.'},401,cookie);
      const result = await upstream('/auth/v1/user',{data:{alias:input.alias}},session.access,'PUT');
      return result.ok ? json(playerData(result.data),200,cookie) : json({error:'Não foi possível salvar o nome.'},400,cookie);
    }
    if (action !== 'rpc' || (!PUBLIC_READS.has(input.method) && !AUTH_ACTIONS.has(input.method))) {
      return json({error:'Operação inválida.'},400,cookie);
    }
    if (!session && AUTH_ACTIONS.has(input.method)) return json({error:'A sessão expirou.',code:'SESSION'},401,cookie);
    const result = await upstream('/rest/v1/rpc/'+input.method, input.args ?? {},session?.access);
    if (!result.ok) {
      const expected = result.data?.code === 'P0001';
      return json({error:expected?result.data.message:'Não foi possível carregar ou salvar a classificação.',
        code:expected?'P0001':undefined},result.status,cookie);
    }
    return json(result.data,200,cookie);
  } catch {
    return json({error:'Serviço de ranking temporariamente indisponível.'},503);
  }
}

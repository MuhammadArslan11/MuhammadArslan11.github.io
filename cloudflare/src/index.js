const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
});

function cors(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = origin === env.ALLOWED_ORIGIN ? origin : env.ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, If-Match',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
    'Access-Control-Expose-Headers': 'ETag',
    'Vary': 'Origin'
  };
}

function canWrite(request, env) {
  if (env.REQUIRE_ACCESS !== 'true') return true;
  // Configure Cloudflare Access in front of this Worker. Access validates the
  // assertion before the request reaches this code; the browser stores no key.
  return Boolean(request.headers.get('Cf-Access-Jwt-Assertion'));
}

async function body(request) {
  if (!request.headers.get('Content-Type')?.includes('application/json')) throw new Error('JSON_REQUIRED');
  const value = await request.json();
  if (!value || typeof value !== 'object') throw new Error('INVALID_BODY');
  return value;
}

async function getDocument(env, key, headers) {
  const row = await env.DB.prepare('SELECT version, payload, updated_at FROM documents WHERE document_key = ?').bind(key).first();
  if (!row) return new Response(null, { status: 404, headers });
  return json({ ...JSON.parse(row.payload), updatedAt: row.updated_at }, 200, { ...headers, ETag: `"${row.version}"` });
}

async function putLibrary(request, env, headers) {
  const value = await body(request);
  if (value.version !== 1 || !Array.isArray(value.courses)) return json({ error: 'A version 1 courses array is required.' }, 422, headers);
  const current = await env.DB.prepare('SELECT version FROM documents WHERE document_key = ?').bind('academy-library').first();
  const supplied = request.headers.get('If-Match');
  if (supplied && current && supplied !== `"${current.version}"`) return json({ error: 'The library changed in another session. Reload before publishing.' }, 412, headers);
  const nextVersion = (current?.version || 0) + 1;
  const now = new Date().toISOString();
  const identity = request.headers.get('Cf-Access-Authenticated-User-Email') || 'access-user';
  await env.DB.prepare(`INSERT INTO documents (document_key, version, payload, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(document_key) DO UPDATE SET version=excluded.version,
    payload=excluded.payload, updated_at=excluded.updated_at, updated_by=excluded.updated_by`)
    .bind('academy-library', nextVersion, JSON.stringify({ version: 1, courses: value.courses }), now, identity).run();
  return json({ version: 1, courses: value.courses, updatedAt: now }, 200, { ...headers, ETag: `"${nextVersion}"` });
}

async function deviceRoute(request, env, headers, namespace, deviceId) {
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(deviceId)) return json({ error: 'Invalid device identifier.' }, 400, headers);
  if (request.method === 'GET') {
    const row = await env.DB.prepare('SELECT payload FROM device_data WHERE namespace = ? AND device_id = ?').bind(namespace, deviceId).first();
    return row ? json(JSON.parse(row.payload), 200, headers) : new Response(null, { status: 404, headers });
  }
  const value = await body(request);
  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO device_data (namespace, device_id, payload, updated_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(namespace, device_id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at`)
    .bind(namespace, deviceId, JSON.stringify(value), now).run();
  return json({ ok: true, updatedAt: now }, 200, headers);
}

export default {
  async fetch(request, env) {
    const headers = cors(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    try {
      const url = new URL(request.url);
      if (url.pathname === '/health' && request.method === 'GET') return json({ ok: true, storage: 'd1' }, 200, headers);
      if (url.pathname === '/academy/library') {
        if (request.method === 'GET') return getDocument(env, 'academy-library', headers);
        if (request.method === 'PUT') return canWrite(request, env) ? putLibrary(request, env, headers) : json({ error: 'Admin authentication required.' }, 401, headers);
      }
      const progress = url.pathname.match(/^\/academy\/progress\/([^/]+)$/);
      if (progress && ['GET', 'PUT'].includes(request.method)) return deviceRoute(request, env, headers, 'academy-progress', decodeURIComponent(progress[1]));
      const resume = url.pathname.match(/^\/resume\/draft\/([^/]+)$/);
      if (resume && ['GET', 'PUT'].includes(request.method)) return deviceRoute(request, env, headers, 'resume-draft', decodeURIComponent(resume[1]));
      return json({ error: 'Not found.' }, 404, headers);
    } catch (error) {
      const clientError = ['JSON_REQUIRED', 'INVALID_BODY'].includes(error.message);
      console.error(error);
      return json({ error: clientError ? 'A valid JSON body is required.' : 'Unexpected server error.' }, clientError ? 400 : 500, headers);
    }
  }
};


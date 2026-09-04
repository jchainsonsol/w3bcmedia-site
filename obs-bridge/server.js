import http from 'node:http';
import crypto from 'node:crypto';
import WebSocket from 'ws';

const HTTP_PORT = Number(process.env.W3BC_BRIDGE_PORT || 8765);
const OBS_URL = process.env.OBS_URL || 'ws://127.0.0.1:4455';
const OBS_PASSWORD = process.env.OBS_PASSWORD || '';
const ALLOWED_SCENES = new Set(['JCHAINS','SHOW PROGRAM','JCHAINS & GUEST']);

let obs = null;
let identified = false;
let hello = null;
let pending = new Map();
let reconnectTimer = null;

function authString(password, authentication) {
  const secret = crypto.createHash('sha256').update(password + authentication.salt).digest('base64');
  return crypto.createHash('sha256').update(secret + authentication.challenge).digest('base64');
}

function connectOBS() {
  if (obs && (obs.readyState === WebSocket.OPEN || obs.readyState === WebSocket.CONNECTING)) return;
  identified = false;
  hello = null;
  obs = new WebSocket(OBS_URL);
  obs.on('message', raw => {
    let msg; try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.op === 0) {
      hello = msg.d;
      const identify = { rpcVersion: 1 };
      if (hello.authentication) {
        if (!OBS_PASSWORD) { console.error('OBS requires authentication. Set OBS_PASSWORD before starting bridge.'); obs.close(); return; }
        identify.authentication = authString(OBS_PASSWORD, hello.authentication);
      }
      obs.send(JSON.stringify({ op: 1, d: identify }));
    } else if (msg.op === 2) {
      identified = true;
      console.log('W3BC OBS Bridge connected to OBS.');
    } else if (msg.op === 7) {
      const id = msg.d?.requestId;
      const waiter = pending.get(id);
      if (waiter) { pending.delete(id); waiter(msg.d); }
    }
  });
  obs.on('close', () => { identified = false; clearTimeout(reconnectTimer); reconnectTimer = setTimeout(connectOBS, 1500); });
  obs.on('error', err => console.error('OBS WebSocket:', err.message));
}

function obsRequest(requestType, requestData = {}) {
  return new Promise((resolve, reject) => {
    if (!obs || obs.readyState !== WebSocket.OPEN || !identified) return reject(new Error('OBS not connected'));
    const requestId = crypto.randomUUID();
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error('OBS request timeout')); }, 3000);
    pending.set(requestId, d => { clearTimeout(timer); d?.requestStatus?.result ? resolve(d) : reject(new Error(d?.requestStatus?.comment || 'OBS request failed')); });
    obs.send(JSON.stringify({ op: 6, d: { requestType, requestId, requestData } }));
  });
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}

function validElgatoHost(host) {
  if (!host || host.length > 128 || /[\/@?#]/.test(host)) return false;
  if (/^[a-z0-9][a-z0-9.-]*\.local$/i.test(host)) return true;
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const n = m.slice(1).map(Number);
  if (n.some(x => x < 0 || x > 255)) return false;
  return n[0] === 10 || n[0] === 127 || (n[0] === 192 && n[1] === 168) || (n[0] === 172 && n[1] >= 16 && n[1] <= 31) || (n[0] === 169 && n[1] === 254);
}

function elgatoRequest(host, method='GET', body=null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const request = http.request({ host, port: 9123, path: '/elgato/lights', method, timeout: 2500, headers: payload ? {'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)} : {} }, response => {
      const chunks=[];
      response.on('data', c => chunks.push(c));
      response.on('end', () => {
        const raw = Buffer.concat(chunks).toString();
        if ((response.statusCode || 500) >= 400) return reject(new Error(`Elgato HTTP ${response.statusCode}`));
        try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid Elgato response')); }
      });
    });
    request.on('timeout', () => request.destroy(new Error('Elgato timeout')));
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
  });
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  if (url.pathname === '/health') {
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({ ok:true, obsConnected:identified, obsUrl:OBS_URL, elgatoBridge:true }));
  }
  if (url.pathname === '/scene' && (req.method === 'POST' || req.method === 'GET')) {
    let scene = url.searchParams.get('name');
    if (req.method === 'POST' && !scene) {
      const chunks=[]; for await (const c of req) chunks.push(c);
      try { scene = JSON.parse(Buffer.concat(chunks).toString() || '{}').sceneName; } catch {}
    }
    if (!ALLOWED_SCENES.has(scene)) { res.writeHead(400, {'Content-Type':'application/json'}); return res.end(JSON.stringify({ok:false,error:'Scene not allowed'})); }
    try {
      await obsRequest('SetCurrentProgramScene', { sceneName: scene });
      res.writeHead(200, {'Content-Type':'application/json'});
      return res.end(JSON.stringify({ok:true,scene}));
    } catch (e) {
      res.writeHead(503, {'Content-Type':'application/json'});
      return res.end(JSON.stringify({ok:false,error:e.message}));
    }
  }
  if (url.pathname === '/elgato' && (req.method === 'GET' || req.method === 'POST')) {
    let host = url.searchParams.get('host');
    let state = null;
    if (req.method === 'POST') {
      const chunks=[]; for await (const c of req) chunks.push(c);
      try { const body=JSON.parse(Buffer.concat(chunks).toString() || '{}'); host = body.host || host; state = body.state || {}; } catch {}
    }
    if (!validElgatoHost(host)) { res.writeHead(400, {'Content-Type':'application/json'}); return res.end(JSON.stringify({ok:false,error:'Use a private IP or .local hostname for the Elgato light.'})); }
    try {
      const data = req.method === 'GET' ? await elgatoRequest(host) : await elgatoRequest(host,'PUT',{numberOfLights:1,lights:[state || {}]});
      res.writeHead(200, {'Content-Type':'application/json'});
      return res.end(JSON.stringify({ok:true,host,data}));
    } catch (e) {
      res.writeHead(503, {'Content-Type':'application/json'});
      return res.end(JSON.stringify({ok:false,error:e.message}));
    }
  }
  res.writeHead(404, {'Content-Type':'application/json'}); res.end(JSON.stringify({ok:false,error:'Not found'}));
});

server.listen(HTTP_PORT, '127.0.0.1', () => console.log(`W3BC OBS Bridge: http://127.0.0.1:${HTTP_PORT}`));
connectOBS();
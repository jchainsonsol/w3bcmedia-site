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

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  if (url.pathname === '/health') {
    res.writeHead(200, {'Content-Type':'application/json'});
    return res.end(JSON.stringify({ ok:true, obsConnected:identified, obsUrl:OBS_URL }));
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
  res.writeHead(404, {'Content-Type':'application/json'}); res.end(JSON.stringify({ok:false,error:'Not found'}));
});

server.listen(HTTP_PORT, '127.0.0.1', () => console.log(`W3BC OBS Bridge: http://127.0.0.1:${HTTP_PORT}`));
connectOBS();
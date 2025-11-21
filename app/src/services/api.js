// app/src/services/api.js
// Simple API wrapper using fetch. Adjust BASE_URL.
const BASE_URL = 'http://192.168.1.44:3000'; // ganti dengan host/backend port, contoh http://192.168.1.10:3000
import simpleAuth from '../auth/simpleAuth';

async function request(path, opts = {}) {
  const url = BASE_URL + path;
  const headers = Object.assign({}, opts.headers || {});
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';

  // attach token if available (header 'token' or Authorization Bearer)
  const token = simpleAuth.getToken();
  if (token) {
    headers['token'] = token; // backend menerima header 'token' or Bearer
    // headers['Authorization'] = 'Bearer ' + token; // alternative
  }

  const finalOpts = Object.assign({}, opts, { headers });

  const res = await fetch(url, finalOpts);
  let text = await res.text();
  try {
    const json = JSON.parse(text || 'null');
    if (!res.ok) {
      throw { status: res.status, body: json };
    }
    return json;
  } catch (e) {
    // if response not JSON, rethrow or return raw
    if (res.ok) return text;
    throw e;
  }
}

export default {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' })
};

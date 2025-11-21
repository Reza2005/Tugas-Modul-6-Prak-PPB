// app/src/services/api.js (Perubahan di fungsi request)
// Simple API wrapper using fetch. Adjust BASE_URL.
const BASE_URL = 'http://192.168.1.44:3000'; // Pastikan IP dan Port Anda sudah benar
import simpleAuth from '../auth/simpleAuth';

async function request(path, opts = {}) {
  const url = BASE_URL + path;
  const headers = Object.assign({}, opts.headers || {});
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';

  // attach token if available (header 'token' or Authorization Bearer)
  const token = simpleAuth.getToken(); //
  if (token) {
    headers['token'] = token; // backend menerima header 'token' or Bearer
    // headers['Authorization'] = 'Bearer ' + token; // alternative
  }

  const finalOpts = Object.assign({}, opts, { headers });

  const res = await fetch(url, finalOpts);
  
  // Periksa apakah respons adalah JSON sebelum mencoba parse
  const isJsonResponse = res.headers.get('content-type')?.includes('application/json');
  
  let json = null;
  let text = null;

  if (isJsonResponse) {
      try {
          json = await res.json();
      } catch (e) {
          // Gagal parse JSON, mungkin body-nya kosong atau ada error formatting
          text = await res.text();
          throw { status: res.status, body: text, error: "Invalid JSON response" };
      }
  } else {
      // Jika bukan JSON (misalnya HTML error), baca sebagai teks
      text = await res.text();
  }

  if (!res.ok) {
      // Jika status error (4xx atau 5xx)
      // Throw error dengan body yang lebih informatif (JSON atau teks)
      throw { 
          status: res.status, 
          body: json || text, 
          error: json?.error || String(text).slice(0, 100) || `HTTP Error ${res.status}` 
      };
  }

  // Jika sukses, kembalikan JSON (atau teks jika body kosong/non-json)
  return json ?? text;
}

export default {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' })
};
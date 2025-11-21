// app/src/auth/simpleAuth.js
// Simple frontend-side auth store (in-memory).
// Tidak memakai AsyncStorage agar tidak butuh install.
// Note: token akan hilang saat app reload.

let _token = null;
let _user = null;

function setAuth(token, user) {
  _token = token;
  _user = user;
}

function clearAuth() {
  _token = null;
  _user = null;
}

function getToken() {
  return _token;
}

function getUser() {
  return _user;
}

export default {
  setAuth,
  clearAuth,
  getToken,
  getUser
};

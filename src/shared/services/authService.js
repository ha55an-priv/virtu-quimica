import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from '../../config/apiConfig';
import { httpClient, setAccessToken } from './httpClient';

const TOKEN_KEY = `virtu.quimica.jwt.${Array.from(API_BASE_URL, (char) =>
  char.codePointAt(0).toString(16),
).join('.')}`;

export const ROLES = {
  estudiante: 'ESTUDIANTE',
  docente: 'DOCENTE',
};

function requireProfile(profile) {
  if (!Object.values(ROLES).includes(profile?.rol)) {
    throw new Error('La API devolvió un perfil sin un rol compatible.');
  }
  return profile;
}

export async function signIn(username, password) {
  const { data: response } = await httpClient.post('/auth/login', { username, password });
  const { token, usuario } = response?.data ?? {};
  const profile = requireProfile(usuario);
  if (typeof token !== 'string' || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) {
    throw new Error('La API devolvió un token de sesión inválido.');
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  setAccessToken(token);
  return profile;
}

export async function restoreSession(signal) {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token || signal.aborted) return null;

  setAccessToken(token);
  const { data: response } = await httpClient.get('/auth/me', { signal });
  return requireProfile(response?.data);
}

export async function clearSession() {
  setAccessToken();
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export function loginErrorMessage(error) {
  if (error.response?.status === 401) return 'Usuario o contraseña incorrectos.';
  if (error.response?.status === 400) return 'Revisa el usuario y la contraseña ingresados.';
  if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado. Intenta de nuevo.';
  if (error.code === 'ERR_NETWORK')
    return 'No se pudo conectar. Revisa tu conexión e intenta de nuevo.';
  return 'No se pudo iniciar sesión. Intenta de nuevo.';
}

import axios from 'axios';
import { auth } from './components/firebase';

export const api = axios.create({ timeout: 600000 });
api.interceptors.request.use(async (config) => {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to ASTRA.');
  config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  return config;
});

export async function apiFetch(url, options = {}) {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error('Please sign in to ASTRA.');
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  return fetch(url, { ...options, headers });
}

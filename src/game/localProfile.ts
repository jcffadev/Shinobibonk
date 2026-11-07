const KEY = 'shinobibonk.profiles.v1';
type Progress = Record<string, string>;
type Account = { id: number; login: string; email: string; salt: string; verifier: string };
type Profiles = { next: number; guest: number; active: number; accounts: Account[] };
export type LocalProfile = { name: string; signedIn: boolean; email?: string };

function readProfiles(): Profiles {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) as Profiles : { next: 2, guest: 1, active: 1, accounts: [] };
}

function visibleProfile(state: Profiles): LocalProfile {
  const account = state.accounts.find(a => a.id === state.active);
  return account ? { name: account.login, email: account.email, signedIn: true }
    : { name: 'Guest' + String(state.guest).padStart(3, '0'), signedIn: false };
}

export function readLocalProfile() {
  try { return visibleProfile(readProfiles()); }
  catch { return { name: 'Guest001', signedIn: false } as LocalProfile; }
}

function archiveKey(id: number) { return KEY + '.save.' + id; }

function applyProgress(progress: Progress) {
  for (const key of Object.keys(localStorage)) if (key.startsWith('sb_')) localStorage.removeItem(key);
  for (const [key, value] of Object.entries(progress)) localStorage.setItem(key, value);
}

function switchProfile(current: Profiles, next: Profiles) {
  const before: Progress = {};
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('sb_')) before[key] = localStorage.getItem(key)!;
  }
  const from = archiveKey(current.active), to = archiveKey(next.active);
  const target = localStorage.getItem(to);
  localStorage.setItem(from, JSON.stringify(before));
  try {
    localStorage.removeItem(to);
    applyProgress(target ? JSON.parse(target) as Progress : {});
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch (error) {
    localStorage.removeItem(from);
    applyProgress(before);
    if (target) localStorage.setItem(to, target);
    throw error;
  }
}

const hex = (bytes: Uint8Array) => Array.from(bytes, x => x.toString(16).padStart(2, '0')).join('');

async function derive(password: string, salt: string) {
  if (!globalThis.crypto?.subtle) throw new Error('Abra o jogo em localhost ou HTTPS para usar a conta.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltBytes = Uint8Array.from(salt.match(/../g) ?? [], s => parseInt(s, 16));
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations: 600_000 }, key, 256);
  return hex(new Uint8Array(bits));
}

export async function createLocalProfile(login: string, email: string, password: string): Promise<LocalProfile> {
  login = login.trim();
  email = email.trim().toLowerCase();
  if (!/^[\p{L}\p{N}_-]{3,20}$/u.test(login)) throw new Error('Use de 3 a 20 letras, números, hífens ou sublinhados no login.');
  if (!email.includes('@')) throw new Error('Informe seu e-mail.');
  if (password.length < 8) throw new Error('Use uma senha com pelo menos 8 caracteres.');
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  const verifier = await derive(password, salt);
  const state = readProfiles();
  if (state.active !== state.guest) throw new Error('Saia da conta atual para criar outra.');
  if (state.accounts.some(a => a.login.toLowerCase() === login.toLowerCase() || a.email === email))
    throw new Error('Já existe uma conta com esse login ou e-mail neste navegador.');
  state.accounts.push({ id: state.guest, login, email, salt, verifier });
  state.guest = state.next++;
  localStorage.setItem(KEY, JSON.stringify(state));
  return visibleProfile(state);
}

export async function signInLocalProfile(identifier: string, password: string) {
  const match = identifier.trim().toLowerCase();
  const account = readProfiles().accounts.find(a => a.login.toLowerCase() === match || a.email === match);
  if (!account || await derive(password, account.salt) !== account.verifier) throw new Error('Login, e-mail ou senha incorretos.');
  const state = readProfiles();
  if (state.active !== account.id) switchProfile(state, { ...state, active: account.id });
}

export function signOutLocalProfile() {
  const state = readProfiles();
  if (state.active !== state.guest) switchProfile(state, { ...state, active: state.guest });
}

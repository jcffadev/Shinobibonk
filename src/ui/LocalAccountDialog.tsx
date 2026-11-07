import { useState, type FormEvent } from 'react';
import { createLocalProfile, signInLocalProfile, signOutLocalProfile, type LocalProfile } from '../game/localProfile';

export function LocalAccountDialog({ profile, close, onCreate }: {
  profile: LocalProfile; close: () => void; onCreate: (profile: LocalProfile) => void;
}) {
  const [creating, setCreating] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const values = new FormData(event.currentTarget);
    const value = (name: string) => String(values.get(name) ?? '');
    try {
      if (creating) {
        onCreate(await createLocalProfile(value('login'), value('email'), value('password')));
        close();
      } else {
        await signInLocalProfile(value('login'), value('password'));
        location.reload();
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Não foi possível acessar a conta.');
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    try { signOutLocalProfile(); location.reload(); }
    catch { setError('Não foi possível sair e salvar seu progresso.'); }
  }

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !busy) close(); }}>
    <section className="account-modal" role="dialog" aria-modal="true" aria-label="Conta ShinobiBonk">
      <button className="modal-close" aria-label="Fechar" disabled={busy} onClick={close}>×</button>
      <div className="modal-emblem">忍</div>
      <h2>{profile.signedIn ? profile.name : creating ? 'Criar conta' : 'Entrar'}</h2>
      {profile.signedIn ? <>
        <p>{profile.email}</p>
        <button className="button secondary-button modal-guest" onClick={signOut}>Sair da conta</button>
      </> : <>
        <p>{creating ? 'Seu progresso atual como ' + profile.name + ' passa para a conta.' : 'Use o login ou e-mail cadastrado neste navegador.'}</p>
        <form key={String(creating)} onSubmit={submit}>
          <fieldset className="future-fields" disabled={busy}>
            <label>{creating ? 'Login' : 'Login ou e-mail'}<input required name="login" autoComplete="username" maxLength={creating ? 20 : 254} /></label>
            {creating && <label>E-mail<input required name="email" type="email" autoComplete="email" maxLength={254} /></label>}
            <label>Senha<input required name="password" type="password" autoComplete={creating ? 'new-password' : 'current-password'} minLength={creating ? 8 : undefined} maxLength={128} /></label>
            <button className="button primary-button modal-guest" type="submit">{creating ? 'Criar conta' : 'Entrar'}</button>
          </fieldset>
        </form>
        <button className="button secondary-button modal-guest" disabled={busy} onClick={() => { setCreating(!creating); setError(''); }}>
          {creating ? 'Já tenho conta' : 'Criar conta com meu progresso'}
        </button>
      </>}
      {error && <p role="alert">{error}</p>}
      <small className="local-warning">Conta e progresso locais neste navegador.</small>
    </section>
  </div>;
}

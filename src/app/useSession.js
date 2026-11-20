import { useCallback, useEffect, useRef, useState } from 'react';

import { clearSession, restoreSession, signIn } from '../shared/services/authService';
import { onSessionRejected } from '../shared/services/httpClient';

export default function useSession() {
  const [session, setSession] = useState({ status: 'restoring' });
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const clearing = useRef(false);

  const logout = useCallback(async (message) => {
    if (clearing.current) return;
    clearing.current = true;
    setSession({ status: 'clearing' });
    try {
      await clearSession();
      setSession({ status: 'signedOut', message });
    } catch {
      setSession({ status: 'clearFailed' });
    } finally {
      clearing.current = false;
    }
  }, []);

  useEffect(() => {
    return onSessionRejected(() => {
      void logout('Tu sesión ya no es válida. Vuelve a iniciar sesión.');
    });
  }, [logout]);

  useEffect(() => {
    const controller = new AbortController();
    restoreSession(controller.signal)
      .then((profile) => {
        if (!controller.signal.aborted) {
          setSession(profile ? { status: 'signedIn', profile } : { status: 'signedOut' });
        }
      })
      .catch((error) => {
        // El interceptor ya está cerrando la sesión si el servidor rechazó el token.
        const status = error.response?.status;
        if (!controller.signal.aborted && status !== 401 && status !== 403) {
          setSession({ status: 'restoreFailed' });
        }
      });
    return () => controller.abort();
  }, [restoreAttempt]);

  function retryRestore() {
    setSession({ status: 'restoring' });
    setRestoreAttempt((attempt) => attempt + 1);
  }

  async function login(username, password) {
    const profile = await signIn(username, password);
    setSession({ status: 'signedIn', profile });
  }

  return { session, login, logout, retryRestore };
}

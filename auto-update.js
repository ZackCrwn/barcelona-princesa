(() => {
  const VERSION_URL = './version.json';
  const CHECK_EVERY_MS = 60000;
  let currentVersion = null;
  let checking = false;

  async function readVersion() {
    const response = await fetch(VERSION_URL + '?_=' + Date.now(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!response.ok) throw new Error('No se pudo consultar la versión');
    const data = await response.json();
    return data.version || null;
  }

  async function checkForUpdate() {
    if (checking || document.visibilityState === 'hidden') return;
    checking = true;
    try {
      const latestVersion = await readVersion();
      if (!latestVersion) return;
      if (currentVersion === null) {
        currentVersion = latestVersion;
        return;
      }
      if (latestVersion !== currentVersion) {
        const key = 'andrea-update-reloaded-' + latestVersion;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
        }
      }
    } catch (error) {
      // Si no hay conexión, el diario sigue funcionando con la versión cargada.
    } finally {
      checking = false;
    }
  }

  checkForUpdate();
  window.setInterval(checkForUpdate, CHECK_EVERY_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
})();
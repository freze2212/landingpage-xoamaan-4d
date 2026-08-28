// Single source of truth: /data/domains.json
(function () {
  let store = null;
  let resolved = null;
  let loadPromise = null;

  function resolveForHost(host) {
    if (!store) return null;
    host = (host || '').toLowerCase().trim();
    const cleanHost = host.replace(/^www\./, '');
    const match = store.domains[host] || store.domains[cleanHost] || {};
    const def = store.default || {};
    return {
      targetUrl: match.targetUrl || def.targetUrl || '',
      telegramUrl: match.telegramUrl || def.telegramUrl || '',
      telegramHandle: match.telegramUsername || def.telegramUsername || ''
    };
  }

  function refreshResolved() {
    resolved = resolveForHost(window.location.hostname);
    return resolved;
  }

  function loadConfig() {
    if (!loadPromise) {
      loadPromise = fetch('/data/domains.json', { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('Failed to load domains.json');
          return res.json();
        })
        .then(function (data) {
          store = data;
          return refreshResolved();
        })
        .catch(function (err) {
          console.error('[domain-config]', err);
          return null;
        });
    }
    return loadPromise;
  }

  window.getDomainConfig = function () {
    if (resolved) return resolved;
    if (store) return refreshResolved();
    loadConfig();
    return resolveForHost('') || { targetUrl: '', telegramUrl: '', telegramHandle: '' };
  };

  window.getTargetUrl = function () {
    return window.getDomainConfig().targetUrl;
  };

  window.getTelegramUrl = function () {
    return window.getDomainConfig().telegramUrl;
  };

  window.domainConfigReady = loadConfig();
})();

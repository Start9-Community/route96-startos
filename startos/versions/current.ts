import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.8.1:0',
  releaseNotes: {
    en_US:
      'route96 0.8.1: route96 now runs as an unprivileged user (existing files are handed over automatically at start); clearer startup errors. Full upstream release notes: https://github.com/v0l/route96/releases/tag/v0.8.1',
    es_ES:
      'route96 0.8.1: route96 se ejecuta ahora como usuario sin privilegios (los archivos existentes se transfieren automáticamente al iniciar); errores de inicio más claros. Notas completas de la versión original: https://github.com/v0l/route96/releases/tag/v0.8.1',
    de_DE:
      'route96 0.8.1: route96 läuft jetzt als unprivilegierter Benutzer (vorhandene Dateien werden beim Start automatisch übergeben); klarere Startfehler. Vollständige Upstream-Versionshinweise: https://github.com/v0l/route96/releases/tag/v0.8.1',
    pl_PL:
      'route96 0.8.1: route96 działa teraz jako użytkownik bez uprawnień (istniejące pliki są przekazywane automatycznie przy starcie); czytelniejsze błędy uruchamiania. Pełne informacje o wydaniu upstream: https://github.com/v0l/route96/releases/tag/v0.8.1',
    fr_FR:
      "route96 0.8.1 : route96 s'exécute désormais en tant qu'utilisateur non privilégié (les fichiers existants sont transférés automatiquement au démarrage) ; erreurs de démarrage plus claires. Notes de version amont complètes : https://github.com/v0l/route96/releases/tag/v0.8.1",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

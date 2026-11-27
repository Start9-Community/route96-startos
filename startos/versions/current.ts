import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.8.1:0',
  releaseNotes: {
    en_US:
      'Updated route96 to 0.8.1. route96 now runs without root privileges. Full upstream release notes: https://github.com/v0l/route96/releases/tag/v0.8.1',
    es_ES:
      'Actualizado route96 a 0.8.1. route96 ahora se ejecuta sin privilegios de root. Notas completas de la versión original: https://github.com/v0l/route96/releases/tag/v0.8.1',
    de_DE:
      'route96 auf 0.8.1 aktualisiert. route96 läuft jetzt ohne Root-Rechte. Vollständige Upstream-Versionshinweise: https://github.com/v0l/route96/releases/tag/v0.8.1',
    pl_PL:
      'Zaktualizowano route96 do wersji 0.8.1. route96 działa teraz bez uprawnień roota. Pełne informacje o wydaniu upstream: https://github.com/v0l/route96/releases/tag/v0.8.1',
    fr_FR:
      "Mise à jour de route96 vers la version 0.8.1. route96 s'exécute désormais sans privilèges root. Notes de version amont complètes : https://github.com/v0l/route96/releases/tag/v0.8.1",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

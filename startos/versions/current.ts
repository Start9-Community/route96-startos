import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.8.0:0',
  releaseNotes: {
    en_US:
      'Updates route96 to v0.8.0: security audit fixes, full Blossom compliance (179/179 tests), correct HTTP status codes, CORS and mirror redirect fixes, and an admin option to ban uploaders. The database is migrated automatically on first start; going back to 0.7.0 afterwards is not possible. Built with start-sdk 4.1.0.',
    es_ES:
      'Actualiza route96 a v0.8.0: correcciones de la auditoría de seguridad, compatibilidad completa con Blossom (179/179 pruebas), códigos de estado HTTP correctos, correcciones de CORS y de redirecciones al replicar, y una opción de administración para bloquear a quienes suben archivos. La base de datos se migra automáticamente en el primer inicio; después no es posible volver a 0.7.0. Compilado con start-sdk 4.1.0.',
    de_DE:
      'Aktualisiert route96 auf v0.8.0: Korrekturen aus dem Sicherheitsaudit, volle Blossom-Kompatibilität (179/179 Tests), korrekte HTTP-Statuscodes, Korrekturen bei CORS und Weiterleitungen beim Spiegeln sowie eine Admin-Option zum Sperren von Uploadern. Die Datenbank wird beim ersten Start automatisch migriert; eine Rückkehr zu 0.7.0 ist danach nicht möglich. Gebaut mit start-sdk 4.1.0.',
    pl_PL:
      'Aktualizuje route96 do v0.8.0: poprawki z audytu bezpieczeństwa, pełna zgodność z Blossom (179/179 testów), poprawne kody statusu HTTP, poprawki CORS i przekierowań przy kopiowaniu oraz opcja administratora do blokowania przesyłających. Baza danych jest migrowana automatycznie przy pierwszym uruchomieniu; powrót do 0.7.0 nie jest potem możliwy. Zbudowano z start-sdk 4.1.0.',
    fr_FR:
      "Met à jour route96 vers la v0.8.0 : corrections issues de l'audit de sécurité, conformité Blossom complète (179/179 tests), codes de statut HTTP corrects, corrections CORS et des redirections lors de la mise en miroir, et une option d'administration pour bannir des utilisateurs qui téléversent. La base de données est migrée automatiquement au premier démarrage ; revenir ensuite à la 0.7.0 n'est pas possible. Compilé avec start-sdk 4.1.0.",
  },
  migrations: {
    up: async ({ effects }) => {},
    // route96 0.8.0 applies the user_ban DB migration on start; 0.7.0's sqlx
    // migrator refuses a database with a migration it doesn't know.
    down: IMPOSSIBLE,
  },
})

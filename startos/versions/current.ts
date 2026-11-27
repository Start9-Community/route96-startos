import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.8.1:0',
  releaseNotes: {
    en_US:
      'route96 0.8.1: first-user setup works on MariaDB (strict mode); route96 now runs as an unprivileged user (existing files are handed over automatically at start); clearer startup errors; Lightning payment crediting fix.',
    es_ES:
      'route96 0.8.1: la configuración del primer usuario funciona con MariaDB (modo estricto); route96 se ejecuta ahora como usuario sin privilegios (los archivos existentes se transfieren automáticamente al iniciar); errores de inicio más claros; corrección en la acreditación de pagos Lightning.',
    de_DE:
      'route96 0.8.1: Einrichtung des ersten Benutzers funktioniert mit MariaDB (Strict Mode); route96 läuft jetzt als unprivilegierter Benutzer (vorhandene Dateien werden beim Start automatisch übergeben); klarere Startfehler; Korrektur bei der Gutschrift von Lightning-Zahlungen.',
    pl_PL:
      'route96 0.8.1: konfiguracja pierwszego użytkownika działa z MariaDB (tryb ścisły); route96 działa teraz jako użytkownik bez uprawnień (istniejące pliki są przekazywane automatycznie przy starcie); czytelniejsze błędy uruchamiania; poprawka zaliczania płatności Lightning.',
    fr_FR:
      "route96 0.8.1 : la configuration du premier utilisateur fonctionne avec MariaDB (mode strict) ; route96 s'exécute désormais en tant qu'utilisateur non privilégié (les fichiers existants sont transférés automatiquement au démarrage) ; erreurs de démarrage plus claires ; correction du crédit des paiements Lightning.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

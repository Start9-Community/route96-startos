<p align="center">
  <img src="icon.jpg" alt="route96 Logo" width="21%">
</p>

# route96 on StartOS

> Everything not listed in this document should behave the same as upstream
> route96. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[route96](https://github.com/v0l/route96) is a Blossom and NIP-96 media server for Nostr: clients upload images and video to it and put the links it returns in notes. This package runs it with a bundled MariaDB, restricts uploads to a pubkey whitelist managed from StartOS, and sets the URL route96 writes into blob links from the service's own addresses.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Two images run in two subcontainers: route96 itself and the MariaDB it requires (route96 supports no other database).

| Property      | Value                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| route96 image | `voidic/route96` (upstream), rebuilt by `docker/route96.Dockerfile` only to refresh `ca-certificates` |
| MariaDB image | `mariadb` (official, unmodified)                                                                      |
| Architectures | x86_64, aarch64                                                                                       |
| Entrypoints   | Upstream defaults; route96 gets `--config /config/config.yaml`, MariaDB `--bind-address=127.0.0.1`    |

Subcontainers: `route96-sub` runs the `route96` daemon, `mariadb-sub` runs the `mariadb` daemon. Attach with `start-cli package attach route96 -n route96-sub -- sh` (or `-n mariadb-sub`).

The route96 image is built with upstream's media features, including AI labelling and compression. The package's config enables no label models, so nothing is downloaded from HuggingFace and no labelling runs.

## Volume and Data Layout

Three volumes: blobs, the database, and the package's own state.

| Volume    | Mounted at                            | Contents                                                                 |
| --------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `main`    | `/app/data` in `route96-sub`          | Uploaded blob files                                                      |
| `mysql`   | `/var/lib/mysql` in `mariadb-sub`     | MariaDB datadir: database `route96` (file metadata, users, config table) |
| `startos` | `/config` in `route96-sub`, read-only | `store.json` and the generated `config.yaml`                             |

MariaDB listens on `127.0.0.1:3306` inside the package only. route96 connects as `root` with a random 32-character password generated at install and kept in `store.json`.

## File Models

Two files on the `startos` volume. `store.json` holds every setting; `config.yaml` is derived from it.

| File          | Format | Seeded                                                        | Rewritten                                     | Hand edits                                      |
| ------------- | ------ | ------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| `store.json`  | JSON   | At install: database password, empty whitelist, 100 MiB limit | By the actions                                | Survive, but the actions are the supported path |
| `config.yaml` | YAML   | Never; generated                                              | Completely, from `store.json`, on every start | Lost on the next start                          |

`config.yaml` carries `listen` (`0.0.0.0:8000`), `database`, `storage_dir` (`/app/data`), `max_upload_bytes`, `public_url` and `whitelist`. Nothing else is set, so payments, label models, retention, cold storage, webhooks and the EXIF and steganography checks are off.

- `whitelist` is always written as a list of hex pubkeys. npubs entered in the action are decoded first. An empty whitelist is written as the single entry `no-uploaders-configured`, which matches no pubkey, because route96 treats a missing `whitelist` key as "anyone may upload".
- `public_url` is the Server Settings custom URL if one is set, else the Set Public URL choice, else `http://127.0.0.1:8000`.

route96 also reads a `config` table in its database and layers it over `config.yaml`. It seeds that table only with keys this package does not manage, so the values above always take effect. A row written there through route96's admin interface would override the file; the package creates no admin user, so nothing writes one.

## Dependencies

None.

## Network Access and Interfaces

One HTTP interface serves the whole application.

| Interface id | Type | Port | Serves                                                                                                   |
| ------------ | ---- | ---- | -------------------------------------------------------------------------------------------------------- |
| `blossom`    | `ui` | 8000 | The Blossom API, the NIP-96 API (`/.well-known/nostr/nip96.json`, `/nip96`), and route96's web UI at `/` |

Nostr clients and readers of the user's notes must reach the address set as the public URL, so in practice this interface needs a public domain. Downloads (`GET /<sha256>`) are unauthenticated.

## Installation and First-Run Flow

Install generates the database password, seeds `store.json` with an empty whitelist, and starts MariaDB once to create its datadir and the `route96` database, so an interrupted first start cannot leave a half-initialized database behind. A failed install leaves nothing to repair: reinstall. The service starts and serves downloads and the web UI immediately, but rejects every upload with `403 Not on whitelist` until a pubkey is whitelisted. Two tasks are raised (see [Tasks](#tasks)). Upstream's database migrations run on route96's first start.

## Actions

Each action writes `store.json` and restarts the service, which takes a few seconds and interrupts uploads in progress. All are safe to repeat.

| Action            | Run it when                                                                                                                      | Changes                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `set-whitelist`   | Granting or revoking upload rights. An empty list blocks all uploads.                                                            | `whitelist`. Entries are validated, including the npub checksum, and deduplicated        |
| `set-public-url`  | After adding or changing the domain clients use; blob links carry the wrong host otherwise.                                      | `publicUrl`                                                                              |
| `server-settings` | Changing the per-file size limit, or advertising a URL that is not one of the interface's addresses (an external reverse proxy). | `maxUploadMib`, `customPublicUrl`. A custom URL overrides `set-public-url` until cleared |

The public URL only affects links in new upload responses; links already published keep the host they were issued with. Whitelisted pubkeys may upload, mirror (`PUT /mirror`) and delete their own blobs.

## Tasks

Both tasks are `important`: they never block the service.

| Task             | Raised when                                                                               | Cleared by                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `set-whitelist`  | The whitelist is empty, checked on every container init                                   | Running the action. Emptying the list with the action itself does not re-raise it until the next init |
| `set-public-url` | No public URL is stored, or the stored host is no longer one of the interface's addresses | Picking an address in the action, or the stored address coming back                                   |

## Health Checks

| Check     | Probes                        | Grace | Failure means                                                                                                                                            |
| --------- | ----------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mariadb` | `mariadb-admin ping` over TCP | 120 s | MariaDB has not finished starting or is crash-recovering. Persisting past the grace period means a datadir problem; read the `mariadb` lines in the logs |
| `route96` | `GET http://127.0.0.1:8000/`  | 60 s  | route96 is not listening. It exits if it cannot reach MariaDB or a migration fails; the logs say which                                                   |

## Backups and Restore

All three volumes are copied whole (`ofVolumes`): `main` (blobs), `mysql` (the MariaDB datadir) and `startos` (settings and the database password).

The datadir is copied as files, not dumped. StartOS stops the service before backing up, and InnoDB recovers a copy taken after an unclean stop the way it would after a power loss. The restore reinstalls the same package version, so the same MariaDB reads the files back, with its accounts intact.

A restored instance needs nothing re-entered. Backups are as large as the stored media.

## Limitations and Differences

1. Uploads are whitelist-only. Upstream's open mode and database-managed whitelist are not offered.
2. No admin user is created, so the web UI's admin pages (file review, user bans, runtime config) are unavailable.
3. Payments and per-user quotas are off. There is no total storage cap; disk use is bounded only by the whitelist and free space.
4. AI labelling, auto-moderation, retention auto-delete, cold storage, webhooks, and EXIF and steganography rejection are off.
5. NIP-98-authenticated endpoints (NIP-96 uploads, admin API) accept requests only on the public URL's exact scheme, host and port. A client pointed at any other address of the interface is rejected.
6. `PUT /mirror` fetches from the source URL directly, from the server's outbound gateway.

---

## Quick Reference for AI Consumers

```yaml
package_id: route96
image: voidic/route96
architectures: [x86_64, aarch64]
subcontainers: [route96-sub, mariadb-sub]
volumes:
  main: /app/data
  mysql: /var/lib/mysql
  startos: /config
file_models:
  - startos/store.json
  - startos/config.yaml
startos_managed_env_vars:
  - RUST_LOG
  - MARIADB_ROOT_PASSWORD
  - MARIADB_DATABASE
  - MARIADB_AUTO_UPGRADE
dependencies: none
interfaces:
  blossom: { type: ui, port: 8000 }
actions:
  - set-whitelist
  - set-public-url
  - server-settings
tasks:
  - { action: set-whitelist, severity: important }
  - { action: set-public-url, severity: important }
health_checks:
  - mariadb
  - route96
```

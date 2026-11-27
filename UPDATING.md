# Updating the upstream version

route96 comes from upstream's published image, `voidic/route96`, rebuilt by `docker/route96.Dockerfile` only to refresh `ca-certificates`. MariaDB is the official `mariadb` image, pulled by tag. The nginx front proxy uses an exact release tag and multi-arch index digest in `startos/manifest/index.ts`; update both together after inspecting the replacement with `docker buildx imagetools inspect nginx:<tag>`.

## Determining the upstream version

```sh
gh release view -R v0l/route96 --json tagName -q .tagName
```

The pinned version is the tag in the `FROM` line of `docker/route96.Dockerfile`. MariaDB's is the `dockerTag` of the `mariadb` image in `startos/manifest/index.ts`; stay on the current LTS line.

## Applying the bump

1. In `docker/route96.Dockerfile`, set the new tag and its multi-arch index digest in `FROM voidic/route96:<tag>@sha256:<digest>` (`docker buildx imagetools inspect voidic/route96:<tag>` prints the digest).
2. Set `version` in `startos/versions/current.ts` to `<tag without v>:0`.
3. Read the release's `src/settings.rs`, `src/db_config.rs` (`should_skip`) and `migrations/` for new config keys, keys now seeded into the database `config` table, and schema changes.
4. Confirm that `POST /setup` is still the only route that grants administrator access (the callers of `upsert_first_admin` and `promote_to_admin` under `src/routes/`), and that upstream's `Dockerfile` still sets `USER 10001:10001` (`ROUTE96_UID` in `startos/utils.ts`). The front proxy blocks only `/setup`, and `route96-perms` hands the data to that uid.

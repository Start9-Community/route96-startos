import { writeFile } from 'node:fs/promises'
import { configYaml } from './fileModels/config.yaml'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { primaryUrl } from './primaryUrl'
import { sdk } from './sdk'
import {
  apiPort,
  blossomProxyConfig,
  checkBlossomApi,
  CONFIG_DIR,
  CONFIG_PATH,
  DB_NAME,
  mariadbDaemons,
  MIB,
  NOBODY_SENTINEL,
  route96Port,
  ROUTE96_UID,
  STORAGE_DIR,
  toHexPubkeys,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting route96'))

  const store = await storeJson.read().const(effects)
  if (!store) throw new Error(i18n('store.json not found'))

  const chosenUrl = await primaryUrl.bestUsable(effects).const()
  const publicUrl = (
    store.customPublicUrl ||
    chosenUrl ||
    `http://127.0.0.1:${apiPort}`
  ).replace(/\/+$/, '')

  const whitelist = toHexPubkeys(store.whitelist)
  const maxUploadBytes = Math.round(store.maxUploadMib * MIB)

  await configYaml.write(effects, {
    listen: `127.0.0.1:${route96Port}`,
    database: `mysql://root:${store.dbPassword}@127.0.0.1:3306/${DB_NAME}`,
    storage_dir: STORAGE_DIR,
    max_upload_bytes: maxUploadBytes,
    public_url: publicUrl,
    // Never omit this key: an absent whitelist means "anyone may upload".
    whitelist: whitelist.length ? whitelist : [NOBODY_SENTINEL],
  })

  const route96Sub = sdk.SubContainer.of(
    effects,
    { imageId: 'route96' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: STORAGE_DIR,
        readonly: false,
      })
      .mountVolume({
        volumeId: 'startos',
        subpath: null,
        mountpoint: CONFIG_DIR,
        readonly: true,
      }),
    'route96-sub',
  )

  // route96 runs as uid 10001 since v0.8.1. Blobs written by older versions
  // (as root) and the config file must be usable by that uid: fix ownership
  // as root before every start (only files that are not owned yet).
  const permsSub = sdk.SubContainer.of(
    effects,
    { imageId: 'route96' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: STORAGE_DIR,
        readonly: false,
      })
      .mountVolume({
        volumeId: 'startos',
        subpath: null,
        mountpoint: CONFIG_DIR,
        readonly: false,
      }),
    'route96-perms',
  )

  const proxySub = sdk.SubContainer.of(
    effects,
    { imageId: 'nginx' },
    sdk.Mounts.of(),
    'proxy-sub',
  )
  await writeFile(
    `${await proxySub.rootfs}/etc/nginx/nginx.conf`,
    blossomProxyConfig,
  )

  return (await mariadbDaemons(effects, store.dbPassword))
    .addOneshot('route96-perms', {
      subcontainer: permsSub,
      exec: {
        command: [
          'sh',
          '-c',
          `find ${STORAGE_DIR} ! -uid ${ROUTE96_UID} -exec chown ${ROUTE96_UID}:${ROUTE96_UID} {} + && chmod 0755 ${CONFIG_DIR} && chown root:${ROUTE96_UID} ${CONFIG_PATH} && chmod 0640 ${CONFIG_PATH}`,
        ],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('route96', {
      subcontainer: route96Sub,
      exec: {
        command: sdk.useEntrypoint(['--config', CONFIG_PATH]),
        env: { RUST_LOG: 'info' },
      },
      ready: {
        display: null,
        gracePeriod: 60_000,
        fn: () => checkBlossomApi(effects, route96Port),
      },
      requires: ['mariadb', 'route96-perms'],
    })
    .addDaemon('proxy', {
      subcontainer: proxySub,
      exec: { command: sdk.useEntrypoint() },
      ready: {
        display: i18n('Blossom API'),
        gracePeriod: 60_000,
        fn: () => checkBlossomApi(effects, apiPort),
      },
      requires: ['route96'],
    })
})

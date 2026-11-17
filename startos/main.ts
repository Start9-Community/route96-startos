import { configYaml } from './fileModels/config.yaml'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { primaryUrl } from './primaryUrl'
import { sdk } from './sdk'
import {
  apiPort,
  CONFIG_DIR,
  CONFIG_PATH,
  DB_NAME,
  mariadbDaemons,
  MIB,
  NOBODY_SENTINEL,
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
    listen: `0.0.0.0:${apiPort}`,
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

  return (await mariadbDaemons(effects, store.dbPassword)).addDaemon(
    'route96',
    {
      subcontainer: route96Sub,
      exec: {
        command: sdk.useEntrypoint(['--config', CONFIG_PATH]),
        env: { RUST_LOG: 'info' },
      },
      ready: {
        display: i18n('Blossom API'),
        gracePeriod: 60_000,
        fn: () =>
          sdk.healthCheck.checkWebUrl(effects, `http://127.0.0.1:${apiPort}/`, {
            successMessage: i18n('The Blossom API is responding'),
            errorMessage: i18n('The Blossom API is not responding'),
          }),
      },
      requires: ['mariadb'],
    },
  )
})

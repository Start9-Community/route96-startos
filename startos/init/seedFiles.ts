import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { mariadbDaemons } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    // URL-safe charset: it is embedded in route96's mysql:// connection URL.
    const dbPassword = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })
    await storeJson.merge(effects, {
      dbPassword,
      whitelist: [],
      customPublicUrl: null,
    })
    // An interrupted first-run init leaves a datadir MariaDB can never start on.
    await (await mariadbDaemons(effects, dbPassword)).runUntilSuccess(300_000)
  } else {
    await storeJson.merge(effects, {})
  }
})

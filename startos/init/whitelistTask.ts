import { setWhitelist } from '../actions/whitelist'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const whitelistTask = sdk.setupOnInit(async (effects) => {
  const whitelist = await storeJson.read((s) => s.whitelist).const(effects)
  if (!whitelist?.length) {
    await sdk.action.createOwnTask(effects, setWhitelist, 'important', {
      reason: i18n(
        'Add at least one uploader pubkey. Until then nobody can upload to this server.',
      ),
    })
  }
})

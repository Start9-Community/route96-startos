import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { DEFAULT_MAX_UPLOAD_MIB } from '../utils'

const shape = z.looseObject({
  dbPassword: z.string(),
  publicUrl: z.string().optional().catch(undefined),
  customPublicUrl: z.string().nullable().catch(null),
  whitelist: z.array(z.string()).catch([]),
  maxUploadMib: z.number().catch(DEFAULT_MAX_UPLOAD_MIB),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: '/store.json' },
  shape,
)

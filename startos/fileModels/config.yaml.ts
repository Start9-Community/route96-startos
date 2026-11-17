import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.looseObject({
  listen: z.string(),
  database: z.string(),
  storage_dir: z.string(),
  max_upload_bytes: z.number(),
  public_url: z.string(),
  whitelist: z.array(z.string()),
})

export const configYaml = FileHelper.yaml(
  { base: sdk.volumes.startos, subpath: '/config.yaml' },
  shape,
)

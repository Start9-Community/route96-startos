import { T } from '@start9labs/start-sdk'
import { i18n } from './i18n'
import { sdk } from './sdk'

export const apiPort = 8000

export const mainHostId = 'main'
export const blossomInterfaceId = 'blossom'

export const MARIADB_DATADIR = '/var/lib/mysql' as const
export const DB_NAME = 'route96'

export const CONFIG_DIR = '/config'
export const CONFIG_PATH = `${CONFIG_DIR}/config.yaml`
export const STORAGE_DIR = '/app/data'
// Upstream image user since v0.8.1 (stays fixed per maintainer; changes are announced in CHANGELOG)
export const ROUTE96_UID = 10001

// Ready only once TCP is up, which the entrypoint opens after its first-run init.
export const mariadbDaemons = async (
  effects: T.Effects,
  dbPassword: string,
) => {
  const sub = await sdk.SubContainer.of(
    effects,
    { imageId: 'mariadb' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'mysql',
      subpath: null,
      mountpoint: MARIADB_DATADIR,
      readonly: false,
    }),
    'mariadb-sub',
  )
  return sdk.Daemons.of(effects).addDaemon('mariadb', {
    subcontainer: sub,
    exec: {
      command: sdk.useEntrypoint(['--bind-address=127.0.0.1']),
      env: {
        MARIADB_ROOT_PASSWORD: dbPassword,
        MARIADB_DATABASE: DB_NAME,
        MARIADB_AUTO_UPGRADE: '1',
      },
    },
    ready: {
      display: i18n('Database'),
      gracePeriod: 120_000,
      fn: async () => {
        const { exitCode } = await sub.exec(
          ['mariadb-admin', '-h', '127.0.0.1', '-uroot', 'ping'],
          { env: { MYSQL_PWD: dbPassword } },
        )
        return exitCode === 0
          ? { result: 'success', message: i18n('The database is ready') }
          : { result: 'starting', message: i18n('Starting the database…') }
      },
    },
    requires: [],
  })
}

export const MIB = 1024 * 1024
export const DEFAULT_MAX_UPLOAD_MIB = 100

// Not 64-char hex, so it matches no pubkey.
export const NOBODY_SENTINEL = 'no-uploaders-configured'

// NIP-19 npub decoding (BIP-173 bech32 checksum)
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let chk = 1
  for (const v of values) {
    const top = chk >>> 25
    chk = ((chk & 0x1ffffff) << 5) ^ v
    for (let i = 0; i < 5; i++) if ((top >>> i) & 1) chk ^= GEN[i]
  }
  return chk >>> 0
}

function bech32HrpExpand(hrp: string): number[] {
  const out: number[] = []
  for (const c of hrp) out.push(c.charCodeAt(0) >> 5)
  out.push(0)
  for (const c of hrp) out.push(c.charCodeAt(0) & 31)
  return out
}

function decodeNpub(npub: string): string {
  const s = npub.toLowerCase()
  const sep = s.lastIndexOf('1')
  const hrp = s.slice(0, sep)
  if (hrp !== 'npub') throw new Error(`not an npub: ${npub}`)
  const data: number[] = []
  for (const c of s.slice(sep + 1)) {
    const v = BECH32_CHARSET.indexOf(c)
    if (v === -1) throw new Error(`invalid bech32 character in ${npub}`)
    data.push(v)
  }
  if (data.length < 6) throw new Error(`npub too short: ${npub}`)
  if (bech32Polymod([...bech32HrpExpand(hrp), ...data]) !== 1)
    throw new Error(`bad npub checksum: ${npub}`)
  let acc = 0
  let bits = 0
  const bytes: number[] = []
  for (const v of data.slice(0, -6)) {
    acc = (acc << 5) | v
    bits += 5
    while (bits >= 8) {
      bits -= 8
      bytes.push((acc >> bits) & 0xff)
    }
  }
  if (bytes.length !== 32) throw new Error(`npub is not a 32-byte key: ${npub}`)
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function toHexPubkey(input: string): string {
  const s = input.trim()
  if (/^[0-9a-fA-F]{64}$/.test(s)) return s.toLowerCase()
  if (/^npub1[02-9ac-hj-np-z]{58}$/i.test(s)) return decodeNpub(s)
  throw new Error(`not an npub or 64-character hex pubkey: ${input}`)
}

export function toHexPubkeys(inputs: readonly string[]): string[] {
  const out = new Set<string>()
  for (const i of inputs) {
    try {
      out.add(toHexPubkey(i))
    } catch {
      console.warn(`route96: ignoring invalid whitelist entry: ${i}`)
    }
  }
  return [...out].sort()
}

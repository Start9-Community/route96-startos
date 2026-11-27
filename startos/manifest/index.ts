import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'route96',
  title: 'route96 (Blossom)',
  license: 'other',
  packageRepo: 'https://github.com/Start9-Community/route96-startos',
  upstreamRepo: 'https://github.com/v0l/route96',
  marketingUrl: 'https://github.com/v0l/route96',
  donationUrl: null,
  description: { short, long },
  volumes: ['main', 'mysql', 'startos'],
  images: {
    route96: {
      source: {
        dockerBuild: {
          workdir: './docker',
          dockerfile: './docker/route96.Dockerfile',
        },
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
    nginx: {
      source: {
        dockerTag:
          'nginx:1.30.8-alpine@sha256:8eb04fe3b385090e9aa02961f77398ad09b6bf33ab07f6669a5bb7acce22c0d3',
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
    mariadb: {
      source: { dockerTag: 'mariadb:11.4.13' },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
  },
})

# route96

## Documentation

- [route96 README](https://github.com/v0l/route96/blob/main/README.md) — features, API endpoints and authentication
- [Blossom](https://github.com/hzrd149/blossom) — the Blossom protocol specification (BUDs)

## What you get on StartOS

A media server your Nostr clients upload images and video to. Anyone can download what is stored on it; only the Nostr keys you whitelist can upload, mirror and delete. The **Blossom API** interface serves both the API your clients use and route96's own web page.

## Getting set up

1. Add a public domain to the **Blossom API** interface. Nostr clients, and everyone who reads your notes, have to load your media from it.
2. Run **Set Public URL** and choose that domain's `https://` address. route96 writes this address into every link it hands back, so an address other people can't reach makes your media unloadable.
3. Run **Uploader Whitelist** and add your Nostr public key, as `npub1…` or 64-character hex. Add any other accounts that should be able to upload.
4. In your Nostr client, add your public URL as a Blossom or media server (in Amethyst, Primal, noStrudel or Coracle look for "Media servers" or "Blossom servers") and make it your upload server. Sign in to the client with a key you whitelisted.

Until step 3, every upload is refused.

## Using route96

### Actions

- **Uploader Whitelist** — who may upload. Remove every entry to stop all uploads.
- **Set Public URL** — the address put in links. Run it again if you change domains.
- **Server Settings** — the largest file accepted (100 MiB unless you change it), and a custom public URL for an address that isn't listed in **Set Public URL**, such as a reverse proxy you run elsewhere. A custom URL takes priority; clear it to go back to your **Set Public URL** choice.

Each action restarts route96 for a few seconds.

### Web interface

Opening the **Blossom API** interface shows route96's upload page. Its admin pages need an admin account, which this service does not set up.

### Mirroring and your home IP

When a client asks route96 to mirror a file from another server, route96 downloads it itself, so that server sees your server's address. If you publish route96 through a tunnel to keep your home IP private, send its outbound traffic through that tunnel too. If you use the tunnel for another reason, such as a port your router can't forward, there is nothing to change.

### After restoring from a backup

Your media, settings and whitelist come back, but StartOS leaves the public domain switched off. Start route96, open the **Blossom API** interface and enable your public domain again. Until you do, the links route96 hands out point to a local address that Nostr clients can't reach.

## Limitations

- There is no limit on total storage. Disk use grows with what your whitelisted keys upload, so keep an eye on free space.

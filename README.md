<p align="center">
  <img src="./public/logo_full.svg" alt="CamCore Cameron-Media Requests" width="620">
</p>

<p align="center">
  CamCore-branded deployment of Seerr for requesting Movies and TV Shows on Cameron-Media.
</p>

<p align="center">
  <a href="https://requests.camcore.au"><strong>Open Cameron-Media Requests</strong></a>
  ·
  <a href="https://status.camcore.au">CamCore Status</a>
  ·
  <a href="https://github.com/seerr-team/seerr">Upstream Seerr</a>
</p>

## About this repository

This repository is the CamCore-maintained fork of [Seerr](https://github.com/seerr-team/seerr). It keeps the upstream media-request functionality while applying CamCore branding and providing a CamCore container image for the existing Cameron-Media Requests service.

The application integrates with Plex, Sonarr and Radarr and retains Seerr's existing request, user, notification and administration features.

## CamCore container image

The `develop` branch automatically builds and publishes:

```text
ghcr.io/camcoreau/seerr:latest
```

The image is built for `linux/amd64` and `linux/arm64`.

## Updating the existing service

The live service can move to the CamCore image without recreating its configuration.

Seerr stores persistent application data under:

```text
/app/config
```

Keep the current host folder mapped to `/app/config` and change only the image reference to:

```text
ghcr.io/camcoreau/seerr:latest
```

This preserves the existing database, users, requests, Plex connection, Sonarr and Radarr settings, notification agents and application preferences.

Back up the mapped config folder before updating.

See [CamCore Deployment](./docs/camcore-deployment.md) for the complete update, verification and rollback process.

## Example Docker Compose service

```yaml
services:
  seerr:
    image: ghcr.io/camcoreau/seerr:latest
    init: true
    container_name: seerr
    restart: unless-stopped
    environment:
      - TZ=Australia/Melbourne
      - PORT=5055
    ports:
      - "5055:5055"
    volumes:
      - /path/to/existing/seerr/config:/app/config
    healthcheck:
      test: wget --no-verbose --tries=1 --spider http://localhost:5055/api/v1/settings/public || exit 1
      start_period: 20s
      timeout: 3s
      interval: 15s
      retries: 3
```

Replace the example host path with the exact config-folder path already used by the current container.

## CamCore branding

The CamCore customisation includes:

- CamCore login branding
- CamCore navigation wordmark
- CamCore application and browser icon
- CamCore PWA name, theme and shortcut identity
- CamCore offline page
- CamCore container metadata

The application title stored in the existing Seerr configuration remains configurable and is not reset by the branded image.

## Upstream project

Seerr is a free and open-source media request and discovery manager for Plex, Jellyfin and Emby. It integrates with services including Sonarr and Radarr.

Upstream resources:

- [Seerr source repository](https://github.com/seerr-team/seerr)
- [Seerr documentation](https://docs.seerr.dev)
- [Seerr issue tracker](https://github.com/seerr-team/seerr/issues)
- [Seerr releases](https://github.com/seerr-team/seerr/releases)

CamCore-specific branding and deployment issues should be handled in this repository. General application bugs and feature requests should be checked against the upstream project first.

## Development

Install dependencies:

```sh
pnpm install
```

Start the development environment:

```sh
pnpm dev
```

Run checks:

```sh
pnpm typecheck
pnpm lint
pnpm test
```

Build the production application:

```sh
pnpm build
```

Build the container locally:

```sh
docker build -t camcore-seerr:local .
```

## Keeping the fork current

The CamCore fork should regularly incorporate security fixes and stable changes from `seerr-team/seerr`.

When updating from upstream:

1. Review upstream release notes and migration guidance.
2. Back up the current live config folder.
3. Merge or rebase the upstream changes into the CamCore fork.
4. Resolve branding-file conflicts without removing upstream functionality.
5. Run type checking, linting, tests and a production build.
6. Publish the updated CamCore image.
7. Test the image against a copy of the existing configuration where practical.
8. Deploy while retaining the existing `/app/config` mapping.
9. Verify the live service and record major changes in CamCore Operations.

## Credits

The underlying Seerr application is developed and maintained by the [Seerr team](https://github.com/seerr-team) and its open-source contributors.

CamCore branding, deployment workflow and operational documentation are maintained for the **CamCore – Cameron Family Secure Network** environment.

CamCore does not claim ownership of the original Seerr project.

## Licence

This repository remains subject to the upstream [MIT Licence](LICENSE).

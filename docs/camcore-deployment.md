# CamCore Deployment

This fork publishes a CamCore-branded Seerr image to:

```text
ghcr.io/camcoreau/seerr:latest
```

## Preserve the existing configuration

Seerr stores its persistent database, settings, users, requests, integrations and notification configuration under:

```text
/app/config
```

When replacing the current image, keep the existing host folder mapped to `/app/config`. Do not create a new config folder and do not remove the current volume mapping.

Only the container image needs to change.

## Before updating

1. Stop the current Seerr container.
2. Back up the existing host folder that is mapped to `/app/config`.
3. Record the current port mapping, environment variables, network and reverse-proxy destination.
4. Confirm that the existing config folder is writable by UID and GID `1000:1000`.

Example permission repair when required:

```sh
docker run --rm \
  -v /path/to/existing/seerr/config:/data \
  alpine chown -R 1000:1000 /data
```

## Docker Compose update

Keep the current service definition and change only the `image` value.

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

Replace `/path/to/existing/seerr/config` with the exact host path already used by the current container.

Update the container with:

```sh
docker compose pull
docker compose up -d
```

## Synology Container Manager

When updating through Synology Container Manager:

1. Confirm the existing container's volume mapping to `/app/config`.
2. Back up the mapped host folder.
3. Change the image to `ghcr.io/camcoreau/seerr:latest`.
4. Keep the existing container name, ports, environment variables, network and volume mappings.
5. Recreate or update the container.
6. Confirm that the application opens and existing requests, users and integrations are present.

If the GitHub Container Registry package is private, authenticate Container Manager to `ghcr.io` or change the package visibility to public in GitHub Packages.

## Verification

After deployment, confirm:

- The CamCore logo appears on the sign-in page and navigation.
- Existing user accounts remain available.
- Existing requests and request history remain available.
- Plex authentication works.
- Sonarr and Radarr connections test successfully.
- Notification agents remain configured.
- `https://requests.camcore.au` loads through the existing reverse proxy.
- The health endpoint responds successfully:

```text
/api/v1/settings/public
```

## Rollback

To roll back the application image without losing configuration:

1. Stop the CamCore image.
2. Restore the previous image reference.
3. Keep the same `/app/config` volume mapping.
4. Recreate the container.

If a database migration prevents rollback, stop the container and restore the config-folder backup taken before the update.

## Upstream updates

CamCore branding changes should be kept separate from upstream functionality where practical. When pulling new changes from `seerr-team/seerr`, resolve branding conflicts carefully and rebuild the CamCore image before deployment.

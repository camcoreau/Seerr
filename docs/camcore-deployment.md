# CamCore Deployment

This fork publishes the CamCore-branded Cameron-Media Requests image to:

```text
ghcr.io/camcoreau/seerr:latest
```

The CamCore production image is built for `linux/amd64`.

## Release model

A push to `develop` does not publish the CamCore image until the fork has passed its validation job. The CamCore workflow runs formatting, linting, type checking and unit tests before the AMD64 container is built and pushed.

Published tags include:

```text
ghcr.io/camcoreau/seerr:latest
ghcr.io/camcoreau/seerr:camcore
ghcr.io/camcoreau/seerr:develop-<sha>
```

The SHA tag provides an immutable rollback target for each successful build.

## Preserve the existing configuration

Seerr stores its persistent database, settings, users, requests, integrations and notification configuration under:

```text
/app/config
```

When replacing the current image, keep the existing host folder mapped to `/app/config`. Do not create a new config folder and do not remove the current volume mapping.

Only the container image needs to change.

## Before updating

1. Back up the existing host folder that is mapped to `/app/config`.
2. Record the current image tag or digest.
3. Record the current port mapping, environment variables, network and reverse-proxy destination.
4. Confirm that the existing config folder is writable by UID and GID `1000:1000`.
5. Confirm the CamCore image workflow completed successfully for the version being deployed.

Example permission repair when required:

```sh
docker run --rm \
  -v /path/to/existing/seerr/config:/data \
  alpine chown -R 1000:1000 /data
```

## Docker Compose

Keep the current service definition and change only the `image` value when moving between CamCore builds.

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
3. Change the image to the required `ghcr.io/camcoreau/seerr` tag.
4. Keep the existing container name, ports, environment variables, network and volume mappings.
5. Recreate or update the container.
6. Confirm that the application opens and existing requests, users and integrations are present.

If the GitHub Container Registry package is private, authenticate Container Manager to `ghcr.io`. Otherwise keep the package public for pull-only deployment.

## CamCore email identity

Cameron-Media Requests uses the CamCore application sender standard:

| Setting | Value |
| --- | --- |
| Sender name | `Requests | CamCore Media` |
| From address | `help@camcore.au` |
| Full From identity | `Requests | CamCore Media <help@camcore.au>` |
| SMTP host | `192.168.5.101` |
| SMTP port | `25` |
| Encryption | None on the private CamCore LAN |
| Use | Request confirmations and status updates |

The CamCore fork also provides branded HTML templates for:

- request pending, approved, available, declined and failed notifications;
- automatically submitted and automatically approved requests;
- media issue notifications and comments;
- account creation;
- password reset;
- email test notifications.

The email design follows the same communication system used by CamCore Operations support messages: a dark CamCore header, cyan divider, service label, event badge, white content area, structured detail panels, cyan primary action and CamCore footer links.

After changing email settings, send a test notification and confirm:

- the sender is `Requests | CamCore Media <help@camcore.au>`;
- the CamCore logo loads;
- the subject starts with `[CamCore Media]`;
- the email displays correctly in Outlook desktop and Outlook on the web;
- the Help Centre and Service Status links work;
- request and issue buttons return to `https://requests.camcore.au`.

## Post-deployment verification

After deployment, confirm:

- the CamCore logo appears on the sign-in page and navigation;
- existing user accounts remain available;
- existing requests and request history remain available;
- Plex authentication works;
- Sonarr and Radarr connections test successfully;
- notification agents remain configured;
- a CamCore-branded test email is received successfully;
- `https://requests.camcore.au` loads through the existing reverse proxy;
- the health endpoint responds successfully:

```text
/api/v1/settings/public
```

## Rollback

Prefer an immutable CamCore SHA tag when rolling back the application image:

```text
ghcr.io/camcoreau/seerr:develop-<sha>
```

To roll back without losing configuration:

1. Stop the current CamCore container.
2. Restore the previous known-good image tag or digest.
3. Keep the same `/app/config` volume mapping.
4. Recreate the container.
5. Verify requests, integrations and email notifications.

If a database migration prevents an image-only rollback, stop the container and restore the config-folder backup taken before the update.

## Upstream updates

CamCore branding changes should remain separate from upstream functionality where practical. When pulling new changes from `seerr-team/seerr`:

1. merge upstream into the CamCore fork;
2. review conflicts in the CamCore branding and email template files carefully;
3. allow validation to complete before publishing/deploying the resulting image;
4. verify the live service after deployment;
5. record material changes in CamCore Operations.

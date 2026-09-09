import type { NotificationAgentEmail } from '@server/lib/settings';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import Email from 'email-templates';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { URL } from 'url';
import { openpgpEncrypt } from './openpgpEncrypt';

const CAMCORE_DEFAULT_SENDER_NAME = 'Requests | CamCore Media';
const CAMCORE_EMAIL_LOGO_CID = 'camcore-email-logo';
const CAMCORE_EMAIL_LOGO_PATH = path.join(
  process.cwd(),
  'public',
  'logo_full.png'
);

// Read the dedicated raster logo directly rather than parsing it out of the
// site SVG. Deliberately non-throwing: if the asset is ever missing (bad
// deploy, path change, container built from an incomplete image) we log and
// carry on without the inline logo rather than taking the whole process
// down at import time, since every code path that sends email imports this
// module.
const CAMCORE_EMAIL_LOGO_BUFFER: Buffer | undefined = (() => {
  try {
    return readFileSync(CAMCORE_EMAIL_LOGO_PATH);
  } catch (error) {
    logger.warn(
      `CamCore email logo could not be read from ${CAMCORE_EMAIL_LOGO_PATH}; outgoing emails will omit the inline logo.`,
      { label: 'Email', errorMessage: (error as Error).message }
    );
    return undefined;
  }
})();

const getSocket: SMTPTransport.Options['getSocket'] = (options, callback) => {
  if (!options.host || typeof options.port !== 'number') {
    callback(new Error('SMTP host and port are required'), undefined);
    return;
  }

  const socket = net.connect({
    host: options.host,
    port: options.port,
  });
  const cleanup = () => {
    socket.setTimeout(0);
    socket.removeListener('error', onError);
    socket.removeListener('connect', onConnect);
    socket.removeListener('timeout', onTimeout);
  };
  const onError = (error: Error) => {
    cleanup();
    callback(error, undefined);
  };
  const onConnect = () => {
    cleanup();
    callback(null, { connection: socket });
  };
  const onTimeout = () => {
    cleanup();
    socket.destroy();
    callback(new Error('SMTP connection timed out'), undefined);
  };

  socket.once('error', onError);
  socket.once('connect', onConnect);
  socket.once('timeout', onTimeout);
  socket.setTimeout(10000);
};

class PreparedEmail extends Email {
  public constructor(settings: NotificationAgentEmail, pgpKey?: string) {
    const { applicationUrl } = getSettings().main;

    const transport = nodemailer.createTransport({
      name: applicationUrl ? new URL(applicationUrl).hostname : undefined,
      host: settings.options.smtpHost,
      port: settings.options.smtpPort,
      secure: settings.options.secure,
      ignoreTLS: settings.options.ignoreTls,
      requireTLS: settings.options.requireTls,
      tls: settings.options.allowSelfSigned
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
      auth:
        settings.options.authUser && settings.options.authPass
          ? {
              user: settings.options.authUser,
              pass: settings.options.authPass,
            }
          : undefined,
      getSocket: net.isIP(settings.options.smtpHost) ? undefined : getSocket,
    });

    if (pgpKey) {
      transport.use(
        'stream',
        openpgpEncrypt({
          signingKey: settings.options.pgpPrivateKey,
          password: settings.options.pgpPassword,
          encryptionKeys: [pgpKey],
        })
      );
    }

    super({
      message: {
        from: {
          name: settings.options.senderName || CAMCORE_DEFAULT_SENDER_NAME,
          address: settings.options.emailFrom,
        },
        replyTo: settings.options.emailFrom,
        attachments: CAMCORE_EMAIL_LOGO_BUFFER
          ? [
              {
                filename: 'camcore-logo.png',
                content: CAMCORE_EMAIL_LOGO_BUFFER,
                contentType: 'image/png',
                contentDisposition: 'inline',
                cid: CAMCORE_EMAIL_LOGO_CID,
              },
            ]
          : [],
      },
      send: true,
      transport: transport,
      preview: false,
    });
  }
}

export default PreparedEmail;

/**
 * §4 — Envoi SMTP via une interface (`lib/mail`) :
 * "Fournisseur interchangeable (Brevo, Resend…) utilisé sur son offre gratuite
 * ou à l'usage. Templates versionnés dans le repo."
 */

import nodemailer from 'nodemailer';

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export interface MailProvider {
  sendMail(input: SendMailInput): Promise<{ messageId: string }>;
}

export class SmtpMailProvider implements MailProvider {
  async sendMail(input: SendMailInput): Promise<{ messageId: string }> {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const from = process.env.MAIL_FROM || 'AssoExpert IA <noreply@assoexpert.fr>';

    if (!host) {
      // En environnement local / test sans serveur SMTP configuré
      return { messageId: `local-dev-${Date.now()}@assoexpert.fr` };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || ''
          }
        : undefined
    });

    const info = await transporter.sendMail({
      from,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      text: input.text,
      html: input.html
    });

    return { messageId: info.messageId };
  }
}

export const mail: MailProvider = new SmtpMailProvider();


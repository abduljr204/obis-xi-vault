import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Sends email over SMTP, so any provider works: Gmail (with an app password), Resend,
 * Brevo, Zoho… Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM
 * (see README → Customer emails). Without them, emails are skipped and the store keeps working.
 */
export function emailEnabled() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter: Transporter | null = null;

function getTransport() {
  if (!transporter) {
    const port = Number.parseInt(process.env.SMTP_PORT ?? "", 10) || 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = TLS from the start; 587 upgrades with STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      // Fail fast if the provider is unreachable, so a request never hangs on email.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
}

export type Email = { to: string; subject: string; html: string; text: string; replyTo?: string };

/** Sends one email. Returns false when email isn't configured. Throws if the provider rejects it. */
export async function sendEmail(email: Email): Promise<boolean> {
  const dev = process.env.NODE_ENV !== "production";
  if (!emailEnabled()) {
    if (dev) console.info(`[email] not configured — skipped "${email.subject}" to ${email.to}`);
    return false;
  }

  const info = await getTransport().sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email.to,
    replyTo: email.replyTo || process.env.EMAIL_REPLY_TO || undefined,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  // Ethereal test accounts give a link to view the message in a browser.
  const preview = nodemailer.getTestMessageUrl(info);
  console.info(`[email] sent "${email.subject}"${dev ? ` to ${email.to}` : ""}${preview ? ` — preview: ${preview}` : ""}`);
  return true;
}

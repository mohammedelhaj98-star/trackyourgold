import "server-only";

import nodemailer from "nodemailer";

import { env } from "@/lib/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER && env.SMTP_PASSWORD ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined
});

export async function sendEmail(input: { to: string; subject: string; html: string; text?: string }) {
  if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
    return { skipped: true, reason: "SMTP credentials are not configured." };
  }

  return transporter.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text
  });
}

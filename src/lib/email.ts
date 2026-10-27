import "server-only";
import nodemailer from "nodemailer";

type Enquiry = { name: string; phone: string; email?: string; message: string; source?: string };

const recipients = (fallback: string) =>
  (process.env.ENQUIRY_TO_EMAIL || fallback)
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s));

/**
 * Emails a new enquiry to everyone in ENQUIRY_TO_EMAIL (comma-separated) through Gmail SMTP (Nodemailer).
 * Needs SMTP_USER (the sending Gmail address) and SMTP_PASS (a Google "app password").
 * Returns false when it isn't configured or sending fails — the enquiry is still saved in Supabase.
 */
export async function sendEnquiryEmail(enquiry: Enquiry, fallbackTo: string): Promise<boolean> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  const to = recipients(fallbackTo);
  if (!user || !pass || !to.length) return false;
  try {
    const port = Number(process.env.SMTP_PORT || 465);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || `OOPS! Nepal Website <${user}>`,
      to,
      // Pressing "Reply" answers the visitor directly when they left an email address.
      ...(enquiry.email ? { replyTo: enquiry.email } : {}),
      subject: `New website enquiry — ${enquiry.name}`,
      text: [`Name: ${enquiry.name}`, `Phone: ${enquiry.phone}`, `Email: ${enquiry.email || "(not given)"}`, `Page: ${enquiry.source ?? "website"}`, "", enquiry.message || "(no message)"].join("\n"),
    });
    return info.accepted.length > 0;
  } catch (error) {
    console.error("[enquiry] email failed:", (error as Error).message);
    return false;
  }
}

/**
 * Confirmation sent to the visitor after they submit an enquiry ("we received it, please don't reply to this address").
 * Gmail always sends from the logged-in account, so only the display name says "no-reply"; the text tells people to call instead.
 * Skipped when the visitor left no email address.
 */
export async function sendEnquiryConfirmation(enquiry: Enquiry, contactPhone: string): Promise<boolean> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  if (!user || !pass || !enquiry.email) return false;
  try {
    const port = Number(process.env.SMTP_PORT || 465);
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST || "smtp.gmail.com", port, secure: port === 465, auth: { user, pass } });
    const info = await transport.sendMail({
      from: `OOPS! Nepal (no-reply) <${user}>`,
      to: enquiry.email,
      subject: "We received your enquiry — OOPS! Nepal",
      text: [
        `Hi ${enquiry.name},`,
        "",
        "Thank you for contacting OOPS! Nepal. Your enquiry has been submitted and our team will get back to you soon.",
        "",
        `Need us sooner? Call ${contactPhone}.`,
        "",
        "This is an automatic email from a no-reply address, so please don't reply to it.",
        "— OOPS! Nepal, Dhumbarahi, Kathmandu",
      ].join("\n"),
    });
    return info.accepted.length > 0;
  } catch (error) {
    console.error("[enquiry] confirmation email failed:", (error as Error).message);
    return false;
  }
}

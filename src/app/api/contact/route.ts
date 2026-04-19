import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const INQUIRY_LABELS: Record<string, string> = {
  leasing: 'Retail Leasing',
  events: 'Event Venue',
  sponsorship: 'Brand Partnership',
  general: 'General Inquiry',
};

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const { name, email, company, type = 'general', message, budget } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'name, email, and message are required' }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 422 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'Message too long' }, { status: 422 });
  }

  const label = INQUIRY_LABELS[type] || 'General Inquiry';

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Dubai Mall Epicenter" <${process.env.SMTP_USER}>`,
      to: process.env.INQUIRY_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `[${label}] Inquiry from ${name}`,
      html: `<p><b>${name}</b> (${email}) — ${label}${company ? ` · ${company}` : ''}${budget ? ` · Budget: ${budget}` : ''}</p><p>${message}</p>`,
    }).catch(err => console.error('[CONTACT] Email failed:', err.message));
  } else {
    console.log('[CONTACT] Inquiry (no SMTP):', { name, email, type, message: message.slice(0, 80) });
  }

  return NextResponse.json({
    ok: true,
    message: 'Inquiry received. We will be in touch shortly.',
    ref: `INQ-${Date.now().toString(36).toUpperCase()}`,
  });
}

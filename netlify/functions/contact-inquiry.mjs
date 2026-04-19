// Netlify Functions v2 — Leasing / Partnership / General Inquiry form handler
// POST /.netlify/functions/contact-inquiry

import nodemailer from 'nodemailer';

const INQUIRY_TYPES = {
  leasing: { label: 'Retail Leasing', to: 'leasing@dubai-mall-epicenter.netlify.app' },
  events: { label: 'Event Venue', to: 'events@dubai-mall-epicenter.netlify.app' },
  sponsorship: { label: 'Brand Partnership', to: 'sponsorship@dubai-mall-epicenter.netlify.app' },
  general: { label: 'General Inquiry', to: 'info@dubai-mall-epicenter.netlify.app' },
};

function buildEmailHtml({ name, email, company, type, message, budget }) {
  const typeLabel = INQUIRY_TYPES[type]?.label || type;
  return `
    <div style="font-family:sans-serif;background:#050505;color:#fff;padding:40px;max-width:600px;border:1px solid #c9a052">
      <h2 style="color:#c9a052;text-transform:uppercase;letter-spacing:0.2em;margin:0 0 24px">
        New ${typeLabel} Inquiry
      </h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="color:#999;padding:8px 0;width:120px">Name</td><td style="color:#fff">${name}</td></tr>
        <tr><td style="color:#999;padding:8px 0">Email</td><td style="color:#fff">${email}</td></tr>
        ${company ? `<tr><td style="color:#999;padding:8px 0">Company</td><td style="color:#fff">${company}</td></tr>` : ''}
        ${budget ? `<tr><td style="color:#999;padding:8px 0">Budget</td><td style="color:#c9a052">${budget}</td></tr>` : ''}
        <tr><td style="color:#999;padding:8px 0">Type</td><td style="color:#c9a052">${typeLabel}</td></tr>
      </table>
      <hr style="border:0;border-top:1px solid #333;margin:24px 0"/>
      <p style="color:#999;font-size:0.85em;margin:0 0 8px">Message:</p>
      <p style="color:#fff;line-height:1.6;white-space:pre-wrap">${message}</p>
      <hr style="border:0;border-top:1px solid #333;margin:24px 0"/>
      <p style="color:#555;font-size:0.75em">Submitted: ${new Date().toUTCString()}</p>
    </div>
  `;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, company, type = 'general', message, budget } = body;

  // Basic validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({ error: 'name, email, and message are required' }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 422 });
  }
  if (message.length > 2000) {
    return Response.json({ error: 'Message too long (max 2000 chars)' }, { status: 422 });
  }

  const inquiryConfig = INQUIRY_TYPES[type] || INQUIRY_TYPES.general;

  // Send email if SMTP is configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    try {
      await transporter.sendMail({
        from: `"Dubai Mall Epicenter" <${process.env.SMTP_USER}>`,
        to: process.env.INQUIRY_EMAIL || process.env.SMTP_USER,
        replyTo: email,
        subject: `[${inquiryConfig.label}] Inquiry from ${name}`,
        html: buildEmailHtml({ name, email, company, type, message, budget }),
      });

      // Auto-reply to sender
      await transporter.sendMail({
        from: `"Dubai Mall Epicenter" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your inquiry has been received — The Dubai Mall',
        html: `
          <div style="font-family:sans-serif;background:#050505;color:#fff;padding:40px;border:1px solid #c9a052">
            <h2 style="color:#c9a052;text-transform:uppercase;letter-spacing:0.2em">Thank You, ${name}</h2>
            <p>We have received your <strong style="color:#c9a052">${inquiryConfig.label}</strong> inquiry.</p>
            <p>Our team will respond within 1 business day.</p>
            <p style="color:#666;font-size:0.85em;margin-top:32px">The Dubai Mall Epicenter · Downtown Dubai</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('[INQUIRY] Email failed:', emailErr.message);
    }
  } else {
    console.log('[INQUIRY] No SMTP config — logging only:', { name, email, type, message: message.slice(0, 100) });
  }

  return Response.json({
    ok: true,
    message: 'Inquiry received. We will be in touch shortly.',
    ref: `INQ-${Date.now().toString(36).toUpperCase()}`,
  });
};

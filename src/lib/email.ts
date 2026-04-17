import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not found in .env. Skipping real email delivery.');
    console.log(`[VERIFICATION CODE] ${email}: ${code}`);
    return;
  }

  const info = await transporter.sendMail({
    from: `"Dubai Mall Epicenter" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your 7-Star Verification Code",
    text: `Your verification code is: ${code}. Experience the world's 7-star retail destination.`,
    html: `
      <div style="font-family: sans-serif; background-color: #050505; color: #ffffff; padding: 40px; text-align: center; border: 1px solid #c9a052;">
        <h1 style="color: #c9a052; text-transform: uppercase; letter-spacing: 0.2em;">The Dubai Mall</h1>
        <p style="font-size: 1.1em; color: #ffffff;">Your 7-star experience is waiting.</p>
        <div style="margin: 30px 0; background-color: #1a1a1a; padding: 20px; border-radius: 4px; display: inline-block;">
          <span style="font-size: 2.5em; font-weight: bold; letter-spacing: 0.3em; color: #c9a052;">${code}</span>
        </div>
        <p style="color: #666666; font-size: 0.9em;">Enter this code on the verification page to activate your account.</p>
        <hr style="border: 0; border-top: 1px solid #333333; margin: 30px 0;" />
        <p style="color: #999999; font-size: 0.8em;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

  console.log("Message sent: %s", info.messageId);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:5001'}/reset-password?token=${token}`;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not found in .env. Skipping real email delivery.');
    console.log(`[PASSWORD RESET] ${email}: ${resetUrl}`);
    return;
  }

  const info = await transporter.sendMail({
    from: `"Dubai Mall Management" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Management Portal Password",
    text: `Reset your password by clicking here: ${resetUrl}`,
    html: `
      <div style="font-family: sans-serif; background-color: #050505; color: #ffffff; padding: 40px; text-align: center; border: 1px solid #c9a052;">
        <h1 style="color: #c9a052; text-transform: uppercase; letter-spacing: 0.2em;">The Dubai Mall</h1>
        <p style="font-size: 1.1em; color: #ffffff;">Management Portal Password Recovery</p>
        <div style="margin: 30px 0; background-color: #1a1a1a; padding: 30px; border-radius: 4px; display: inline-block;">
          <a href="${resetUrl}" style="background-color: #c9a052; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; border-radius: 2px;">Reset Password</a>
        </div>
        <p style="color: #666666; font-size: 0.9em; margin-bottom: 20px;">This link will expire in 1 hour.</p>
        <p style="color: #444; font-size: 0.8em; word-break: break-all;">If the button above doesn't work, copy and paste this link: <br/> ${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #333333; margin: 30px 0;" />
        <p style="color: #999999; font-size: 0.8em;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

  console.log("Reset email sent: %s", info.messageId);
}

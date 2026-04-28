const nodemailer = require('nodemailer');

const getTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const templates = {
  welcome: ({ name, companyName }) => ({
    subject: `Welcome to Synkly ERP, ${name}!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f6fb;padding:32px">
        <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
          <h1 style="color:#2563eb;margin:0 0 8px">Welcome to Synkly ERP!</h1>
          <p style="color:#475569;font-size:16px">Hi ${name},</p>
          <p style="color:#475569">Your account for <strong>${companyName}</strong> has been created successfully. You now have full access to your 14-day free trial.</p>
          <div style="margin:28px 0">
            <a href="${process.env.FRONTEND_URL}/client/dashboard" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">Go to Dashboard →</a>
          </div>
          <p style="color:#94a3b8;font-size:13px">Questions? Reply to this email or contact support@synkly.io</p>
        </div>
      </div>`,
  }),

  resetPassword: ({ name, resetUrl, expiresIn }) => ({
    subject: 'Password Reset Request — Synkly ERP',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f6fb;padding:32px">
        <div style="background:#fff;border-radius:12px;padding:40px">
          <h2 style="color:#0f172a">Password Reset Request</h2>
          <p style="color:#475569">Hi ${name}, we received a request to reset your password.</p>
          <p style="color:#475569">Click the button below to reset it. This link expires in <strong>${expiresIn}</strong>.</p>
          <div style="margin:28px 0">
            <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700">Reset Password</a>
          </div>
          <p style="color:#94a3b8;font-size:13px">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
          <p style="color:#94a3b8;font-size:12px;margin-top:16px">Or copy this link: <br/>${resetUrl}</p>
        </div>
      </div>`,
  }),

  contactConfirmation: ({ name, message }) => ({
    subject: "We received your message — Synkly ERP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f6fb;padding:32px">
        <div style="background:#fff;border-radius:12px;padding:40px">
          <h2 style="color:#2563eb">Thank you, ${name}!</h2>
          <p style="color:#475569">We've received your message and will get back to you within 24 hours.</p>
          <div style="background:#f8faff;border-radius:8px;padding:16px;margin:20px 0;border-left:4px solid #2563eb">
            <p style="color:#475569;margin:0;font-style:italic">"${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"</p>
          </div>
          <p style="color:#94a3b8;font-size:13px">— The Synkly ERP Team</p>
        </div>
      </div>`,
  }),

  contactAdmin: ({ name, email, phone, message, subject, company }) => ({
    subject: `New Inquiry: ${subject || 'Website Contact'} — from ${name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2>New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse">
          ${[['Name', name], ['Email', email], ['Phone', phone], ['Company', company || 'N/A'], ['Subject', subject || 'N/A']].map(([k, v]) =>
            `<tr><td style="padding:8px;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0;width:120px">${k}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${v}</td></tr>`
          ).join('')}
        </table>
        <div style="margin-top:20px;padding:16px;background:#f8faff;border-radius:8px">
          <strong>Message:</strong>
          <p style="margin-top:8px;color:#475569">${message}</p>
        </div>
      </div>`,
  }),
};

const sendEmail = async ({ to, subject, template, data, html }) => {
  const transporter = getTransporter();

  let emailContent = { subject, html };
  if (template && templates[template]) {
    const tmpl = templates[template](data || {});
    emailContent = { subject: tmpl.subject || subject, html: tmpl.html };
  }

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject: emailContent.subject,
    html: emailContent.html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;

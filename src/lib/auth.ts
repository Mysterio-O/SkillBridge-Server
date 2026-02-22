import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD,
  },
});

const verificationHtml = (user: any, verificationUrl: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="background:#111827;padding:20px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;">Skill Bridge</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;color:#374151;">
              <h2 style="margin-top:0;font-size:18px;color:#111827;">Verify your email address</h2>
              <p style="font-size:14px;line-height:1.6;">Hi ${user.name ? user.name : 'there'},</p>
              <p style="font-size:14px;line-height:1.6;">Thanks for signing up! Please confirm your email address by clicking the button below.</p>
              <table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td><a href="${verificationUrl}" style="background:#2563eb;color:#ffffff;padding:12px 20px;text-decoration:none;border-radius:6px;font-size:14px;display:inline-block;">Verify Email</a></td></tr></table>
              <p style="font-size:13px;color:#6b7280;line-height:1.6;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="font-size:12px;word-break:break-all;color:#2563eb;">${verificationUrl}</p>
              <p style="font-size:13px;color:#6b7280;line-height:1.6;margin-top:24px;">If you didn’t create an account, you can safely ignore this email.</p>
              <p style="font-size:13px;color:#6b7280;">— Skill Bridge Team</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Skill Bridge. All rights reserved.</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const sendVerificationEmail = async (user: any, token: string) => {
  const verificationUrl = `${process.env.APP_URL}/api/authentication/verify?token=${token}`;
  try {
    const info = await transporter.sendMail({
      from: `"Skill Bridge" <${process.env.APP_USER}>`,
      to: user.email,
      subject: 'Verify Your Skill Bridge Account',
      text: 'Verification Email',
      html: verificationHtml(user, verificationUrl),
    });
    console.log('Verification mail sent: %s', info.messageId);
  } catch (err) {
    console.error('Error while sending verification mail', err);
  }
};

export { transporter };

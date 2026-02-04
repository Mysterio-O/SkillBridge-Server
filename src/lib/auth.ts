import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD,
  },
});

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
  ].filter(Boolean) as string[],
  advanced: {
    useSecureCookies: isProd,
    defaultCookieAttributes: isProd
      ? {
        sameSite: "none",
        secure: true,
        partitioned: true,
      }
      : {
        sameSite: "lax",
        secure: false,
      },
  },
  user: {
    additionalFields: {
      role: { type: ["student", "tutor", "admin"], required: false, defaultValue: "student", input: false },
      phone: { type: "string", required: false },
      status: { type: ["active", "banned", "inactive"], required: false, defaultValue: "active", input: false },
      bio: { type: "string", required: false },
      lastLoginAt: { type: "date", required: false, input: false },
      bannedAt: { type: "date", required: false, input: false },
      banReason: { type: "string", required: false, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // console.log(user,url,token)
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
      try {
        const info = await transporter.sendMail({
          from: `"Skill Bridge" <${process.env.APP_USER}>`, // sender address
          to: user.email, // list of recipients
          subject: "Verify Your Skill Bridge Account", // subject line
          text: "Verification Email", // plain text body
          html: `
                    <!DOCTYPE html>
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
          
          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:20px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;">
                Skill Bridge
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:28px;color:#374151;">
              <h2 style="margin-top:0;font-size:18px;color:#111827;">
                Verify your email address
              </h2>

              <p style="font-size:14px;line-height:1.6;">
                Hi ${user.name?user.name:'there'},
              </p>

              <p style="font-size:14px;line-height:1.6;">
                Thanks for signing up! Please confirm your email address by clicking the button below.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td>
                    <a href="${verificationUrl}"
                      style="
                        background:#2563eb;
                        color:#ffffff;
                        padding:12px 20px;
                        text-decoration:none;
                        border-radius:6px;
                        font-size:14px;
                        display:inline-block;
                      "
                    >
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#6b7280;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="font-size:12px;word-break:break-all;color:#2563eb;">
                ${verificationUrl}
              </p>

              <p style="font-size:13px;color:#6b7280;line-height:1.6;margin-top:24px;">
                If you didn’t create an account, you can safely ignore this email.
              </p>

              <p style="font-size:13px;color:#6b7280;">
                — Skill Bridge Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} Skill Bridge. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>

                    `
        });

        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      } catch (err) {
        console.error("Error while sending mail", err);
      }
    },
  },
  socialProviders: {
    google: {
      prompt: 'select_account consent',
      accessType: 'offline',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
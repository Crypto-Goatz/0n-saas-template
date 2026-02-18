import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('Missing RESEND_API_KEY')
    _resend = new Resend(apiKey)
  }
  return _resend
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'cr0n <noreply@cro9.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cro9.com'
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'cr0n'

interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

const emailStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #030712; color: #e5e7eb; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .header { text-align: center; margin-bottom: 32px; }
  .logo { font-size: 48px; font-weight: 900; background: linear-gradient(135deg, #22d3ee, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .content { background: #111827; border-radius: 16px; padding: 32px; border: 1px solid #1f2937; }
  h1 { color: #ffffff; font-size: 24px; margin: 0 0 16px 0; }
  p { color: #9ca3af; line-height: 1.6; margin: 0 0 16px 0; }
  .button { display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
  .code { background: #1f2937; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 14px; color: #22d3ee; word-break: break-all; }
  .footer { text-align: center; margin-top: 32px; color: #6b7280; font-size: 12px; }
`

function emailWrapper(content: string): string {
  const year = new Date().getFullYear()
  return `<!DOCTYPE html><html><head><style>${emailStyles}</style></head><body>
    <div class="container">
      <div class="header"><div class="logo">${APP_NAME}</div></div>
      <div class="content">${content}</div>
      <div class="footer"><p>&copy; ${year} ${APP_NAME}. All rights reserved.</p></div>
    </div>
  </body></html>`
}

export async function sendEmail({ to, subject, html, text }: {
  to: string; subject: string; html: string; text?: string
}): Promise<EmailResult> {
  try {
    const { data, error } = await getResend().emails.send({ from: FROM_EMAIL, to, subject, html, text })
    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Email exception:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendWelcomeEmail(email: string, name?: string): Promise<EmailResult> {
  const firstName = name?.split(' ')[0] || 'there'
  return sendEmail({
    to: email,
    subject: `Welcome to ${APP_NAME}`,
    html: emailWrapper(`
      <h1>Welcome, ${firstName}!</h1>
      <p>You're all set. Head to your dashboard to get started.</p>
      <a href="${APP_URL}/dashboard" class="button">Go to Dashboard</a>
    `),
  })
}

export async function sendVerificationEmail(email: string, token: string): Promise<EmailResult> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`
  return sendEmail({
    to: email,
    subject: `Verify your ${APP_NAME} email`,
    html: emailWrapper(`
      <h1>Verify your email</h1>
      <p>Click below to verify your email address and activate your account.</p>
      <a href="${verifyUrl}" class="button">Verify Email Address</a>
      <p style="margin-top: 24px; font-size: 14px;">Or copy this link:</p>
      <div class="code">${verifyUrl}</div>
      <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">This link expires in 24 hours.</p>
    `),
  })
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<EmailResult> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`
  return sendEmail({
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    html: emailWrapper(`
      <h1>Reset your password</h1>
      <p>Click below to choose a new password.</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p style="margin-top: 24px; font-size: 14px;">Or copy this link:</p>
      <div class="code">${resetUrl}</div>
      <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">This link expires in 1 hour.</p>
    `),
  })
}

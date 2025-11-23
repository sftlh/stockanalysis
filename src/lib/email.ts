import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    to: email,
    subject: 'Verify your email',
    html: `
      <p>Click the link to verify your email:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    to: email,
    subject: 'Reset your password',
    html: `
      <p>Click the link to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  })
}
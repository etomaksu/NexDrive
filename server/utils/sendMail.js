// Sends the password reset code.
// - If EMAIL_USER and EMAIL_PASS are set, it sends a real email through Gmail (needs: npm install nodemailer).
// - If they are not set, it prints the code in the server console so you can test without any email setup.
const sendResetCode = async (to, code, name) => {
  const { EMAIL_USER, EMAIL_PASS } = process.env

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log(`\n[DEV] Password reset code for ${to}: ${code}\n`)
    return
  }

  const nodemailer = require('nodemailer') // loaded only when real email is configured
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  })

  await transporter.sendMail({
    from: `"NexDrive" <${EMAIL_USER}>`,
    to,
    subject: 'Your NexDrive password reset code',
    text: `Hi ${name || 'there'},\n\nYour NexDrive password reset code is ${code}.\nIt expires in 10 minutes. If you didn't ask for this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px">
        <h2 style="margin:0 0 12px">NexDrive</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Your password reset code is:</p>
        <p style="font-size:28px;letter-spacing:6px;font-weight:bold;margin:16px 0">${code}</p>
        <p style="color:#666">It expires in 10 minutes. If you didn't ask for this, you can ignore this email.</p>
      </div>`,
  })
}

module.exports = { sendResetCode }
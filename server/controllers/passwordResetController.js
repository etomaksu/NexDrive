const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { sendResetCode } = require('../utils/sendMail')

const CODE_TTL_MS = 10 * 60 * 1000 // a code is valid for 10 minutes
const RESEND_MS = 60 * 1000        // at most one new code per minute
const MAX_ATTEMPTS = 5             // wrong guesses before the code is thrown away
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const PASSWORD_MESSAGE = 'Password needs 8+ characters, a capital letter, a number and a symbol.'
const SELECT = '+resetCodeHash +resetCodeExpires +resetCodeAttempts +resetCodeSentAt'

const clean = (email) => String(email || '').toLowerCase().trim()

// the code is never stored as-is, only a hash of it
const hashCode = (code, userId) =>
  crypto.createHash('sha256').update(`${userId}:${code}`).digest('hex')

const sameHash = (a, b) =>
  a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))

// returns the user if the email + code match and are still valid, otherwise null
const checkCode = async (email, code) => {
  const user = await User.findOne({ email, isArchived: { $ne: true } }).select(SELECT)
  if (!user || user.status === 'blocked') return null
  if (!user.resetCodeHash || !user.resetCodeExpires || user.resetCodeExpires < new Date()) return null
  if ((user.resetCodeAttempts || 0) >= MAX_ATTEMPTS) return null

  const ok = sameHash(hashCode(String(code || '').trim(), user._id), user.resetCodeHash)
  if (!ok) {
    await User.updateOne({ _id: user._id }, { $inc: { resetCodeAttempts: 1 } })
    return null
  }
  return user
}

// POST /api/forgot-password   { email }
// Always answers the same way, so nobody can use it to find out which emails have an account.
exports.forgotPassword = async (req, res) => {
  try {
    const email = clean(req.body.email)
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email.' })

    const user = await User.findOne({ email, isArchived: { $ne: true } }).select(SELECT)

    if (user && user.status !== 'blocked') {
      const tooSoon = user.resetCodeSentAt && Date.now() - user.resetCodeSentAt.getTime() < RESEND_MS
      if (!tooSoon) {
        const code = String(crypto.randomInt(100000, 1000000)) // 6 digits
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              resetCodeHash: hashCode(code, user._id),
              resetCodeExpires: new Date(Date.now() + CODE_TTL_MS),
              resetCodeAttempts: 0,
              resetCodeSentAt: new Date(),
            },
          }
        )
        try {
          await sendResetCode(user.email, code, user.firstName)
        } catch (mailErr) {
          console.error('Could not send reset email:', mailErr.message)
        }
      }
    }

    res.json({ message: 'If that email is registered, a code has been sent.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// POST /api/verify-code   { email, code }
exports.verifyCode = async (req, res) => {
  try {
    const user = await checkCode(clean(req.body.email), req.body.code)
    if (!user) return res.status(400).json({ message: 'Invalid or expired code.' })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}

// POST /api/reset-password   { email, code, password }
// The code is checked again here, so the password can't be reset by calling this route with just an email.
exports.resetPassword = async (req, res) => {
  try {
    const { code, password } = req.body
    if (!PASSWORD_RULE.test(String(password || ''))) {
      return res.status(400).json({ message: PASSWORD_MESSAGE })
    }

    const user = await checkCode(clean(req.body.email), code)
    if (!user) return res.status(400).json({ message: 'Invalid or expired code.' })

    await User.updateOne(
      { _id: user._id },
      {
        $set: { password: await bcrypt.hash(password, 10), resetCodeAttempts: 0 },
        $unset: { resetCodeHash: '', resetCodeExpires: '', resetCodeSentAt: '' },
      }
    )
    res.json({ message: 'Password updated.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error.' })
  }
}
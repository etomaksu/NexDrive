// One-time script: links license photos that are already in server/private/licenses
// to their users. Save it as server/scripts/relinkLicenses.js and run from the server folder:
//   node scripts/relinkLicenses.js
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const User = require('./models/User')

const dir = path.join(__dirname, 'private', 'licenses')

;(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/NexDrive')

  // file names look like  <userId>-<front|back>-<random>.jpg  (see middleware/uploadLicense.js)
  const latest = {}
  for (const file of fs.readdirSync(dir)) {
    const m = file.match(/^([a-f0-9]{24})-(front|back)-[a-f0-9]+\.(jpg|png)$/)
    if (!m) continue
    const [, id, side] = m
    const time = fs.statSync(path.join(dir, file)).mtimeMs
    const key = `${id}:${side}`
    if (!latest[key] || time > latest[key].time) latest[key] = { id, side, file, time }
  }

  let linked = 0
  for (const { id, side, file } of Object.values(latest)) {
    const res = await User.updateOne({ _id: id }, { $set: { [`licenseFiles.${side}`]: file } })
    if (res.matchedCount) {
      linked++
      console.log(`linked ${side} for ${id}: ${file}`)
    } else {
      console.log(`no user found for ${file}`)
    }
  }

  console.log(`Done. Linked ${linked} photo(s).`)
  await mongoose.disconnect()
})().catch((err) => {
  console.error(err)
  process.exit(1)
})